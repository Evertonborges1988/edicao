#!/usr/bin/env python3
"""Converte a planilha da família (uma aba por mês) para o JSON que o app importa.

Uso:
    python3 -I converter_planilha.py PLANILHA.xlsx SAIDA.json [MES_ATUAL=AAAA-MM]

A planilha precisa estar SEM senha (ou descriptografada antes).
Não grava nada além do arquivo de saída. Os dados nunca devem ser commitados.
"""
import sys, re, json, uuid, collections, warnings
from datetime import datetime
import openpyxl

warnings.filterwarnings("ignore")
src, dst = sys.argv[1], sys.argv[2]
mes_atual = sys.argv[3] if len(sys.argv) > 3 else datetime.now().strftime("%Y-%m")

CARTOES = {"Santander Bi", "Santander Tom", "Credicard", "Itaú Tom", "Carrefour Tom"}
FIX_CAT = {
    "Alimentação/Lanches": "Alimentação/Lanche", "Allimentação/Lanches": "Alimentação/Lanche",
    "Alimentacao/Lanches": "Alimentação/Lanche", "Alimentção/Lanche": "Alimentação/Lanche",
    "Aimentação/Refeição": "Refeição", "Alimentação/Refeição": "Refeição", "Almoço": "Refeição",
    "Alimetação/Mercado": "Alimentação/Mercado", "Abastecimaneto": "Abastecimento",
    "Aniversários": "Aniversário", "Medicamento": "Medicamentos",
    "Manuteção Casa": "Manutenção Casa", "Dizimo": "Dízimo",
    "Ajuste Cartão": "Ajuste", "Diferença": "Ajuste", "Desconto": "Ajuste",
}


def d(v):
    return v.strftime("%Y-%m-%d") if isinstance(v, datetime) else None


def num(v):
    return round(float(v), 2) if isinstance(v, (int, float)) else 0.0


def txt(v):
    return str(v).strip() if v is not None else ""


wb = openpyxl.load_workbook(src, data_only=True)
despesas, receitas = [], []

for ws in wb:
    m = re.fullmatch(r"(\d\d)\.(\d{4})", ws.title)
    if not m:
        continue
    mes = f"{m.group(2)}-{m.group(1)}"
    head = {txt(c.value).upper(): c.column - 1 for c in ws[3] if c.value}
    # despesas: colunas A.. ; receitas: a partir de "DATA"
    col = lambda nome: head.get(nome)
    tem_conta = col("P. CONTA") is not None
    i_data = col("DATA")
    for r in ws.iter_rows(min_row=4):
        v = [c.value for c in r]
        if len(v) < 17:
            v += [None] * (17 - len(v))
        # --- despesa
        if tem_conta:
            tipo, cat, forn, desc, parc, tparc, valor, dpg, pg = v[2], v[3], v[4], v[5], v[6], v[7], v[8], v[9], v[10]
        else:  # layout antigo (jan/fev 2025): sem P. CONTA
            tipo, cat, forn, desc, parc, tparc, valor, dpg, pg = v[2], None, v[3], v[4], v[5], v[6], v[7], v[8], v[9]
        if txt(tipo) and (txt(desc) or txt(forn)):
            despesas.append(dict(
                id=uuid.uuid4().hex[:12], k="d", mes=mes,
                venc=d(v[0]), comp=d(v[1]),
                tipo="Fixo" if txt(tipo) == "Fixo" else "Variável",
                cat=FIX_CAT.get(txt(cat), txt(cat)), forn=txt(forn), desc=txt(desc),
                parc=int(parc) if isinstance(parc, (int, float)) else 0,
                tparc=int(tparc) if isinstance(tparc, (int, float)) else 0,
                valor=num(valor), pgto=d(dpg), pago=txt(pg).lower() == "pago",
                nota=txt(valor) if isinstance(valor, str) else "",
            ))
        # --- receita
        if i_data is not None:
            dt, nome, val, rec = v[i_data], v[i_data + 1], v[i_data + 2], v[i_data + 3]
            if txt(nome) and not txt(nome).startswith("RECEITAS (-)"):
                receitas.append(dict(
                    id=uuid.uuid4().hex[:12], k="r", mes=mes, venc=d(dt), desc=txt(nome),
                    valor=num(val),
                    pago=(txt(rec).lower() == "recebido") or mes < mes_atual,
                    carry=bool(re.match(r"saldo", txt(nome), re.I)),
                ))

# meses antigos sem P. CONTA: infere categoria pela descrição mais usada nos outros meses
por_desc = collections.defaultdict(collections.Counter)
for x in despesas:
    if x["cat"]:
        por_desc[x["desc"].lower()][x["cat"]] += 1
for x in despesas:
    if not x["cat"]:
        c = por_desc.get(x["desc"].lower())
        x["cat"] = c.most_common(1)[0][0] if c else ""
    # transferências internas / sobras guardadas
    x["transf"] = x["forn"] == "Casa dos Borges"
    if x["transf"] and not x["cat"]:
        x["cat"] = "Transferência"
    if not x["cat"]:
        x["cat"] = "Sem categoria"

json.dump(dict(versao=1, despesas=despesas, receitas=receitas), open(dst, "w"), ensure_ascii=False)
print(f"{len(despesas)} despesas, {len(receitas)} receitas -> {dst}")
