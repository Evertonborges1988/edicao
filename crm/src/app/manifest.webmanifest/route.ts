export function GET() {
  return Response.json({
    name: "Agenda Bela",
    short_name: "Agenda",
    start_url: "/agenda",
    display: "standalone",
    background_color: "#f9fafb",
    theme_color: "#be185d",
    icons: [],
  });
}
