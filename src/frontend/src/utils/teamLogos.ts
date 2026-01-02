const LOGO_MAP: Record<string, string> = {
  "Flamengo": "https://upload.wikimedia.org/wikipedia/commons/2/2e/Flamengo_braz_logo.svg",
  "Palmeiras": "https://upload.wikimedia.org/wikipedia/commons/1/10/Palmeiras_logo.svg",
  "Sao Paulo": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Brasao_do_Sao_Paulo_Futebol_Clube.svg/1200px-Brasao_do_Sao_Paulo_Futebol_Clube.svg.png",
  "São Paulo": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Brasao_do_Sao_Paulo_Futebol_Clube.svg/1200px-Brasao_do_Sao_Paulo_Futebol_Clube.svg.png",
  "Corinthians": "https://upload.wikimedia.org/wikipedia/pt/b/b4/Corinthians_simbolo.png",
  "Atletico Mineiro": "https://upload.wikimedia.org/wikipedia/commons/5/5f/Atl%C3%A9tico_Mineiro_logo.svg",
  "Fluminense": "https://upload.wikimedia.org/wikipedia/commons/a/ad/Fluminense_FC_escudo.png",
  "Gremio": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Gr%C3%AAmio_FBPA_logo.svg/1200px-Gr%C3%AAmio_FBPA_logo.svg.png",
  "Grêmio": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Gr%C3%AAmio_FBPA_logo.svg/1200px-Gr%C3%AAmio_FBPA_logo.svg.png",
  "Internacional": "https://upload.wikimedia.org/wikipedia/commons/f/f1/Escudo_do_Sport_Club_Internacional.svg",
  "Botafogo": "https://upload.wikimedia.org/wikipedia/commons/c/cb/Escudo_Botafogo.svg",
  "Vasco da Gama": "https://upload.wikimedia.org/wikipedia/pt/a/ac/CRVascodaGama.png",
  "Cruzeiro": "https://upload.wikimedia.org/wikipedia/commons/b/b8/Cruzeiro_Esporte_Clube_%28logo%29.svg",
  "Bahia": "https://upload.wikimedia.org/wikipedia/pt/2/2c/Esporte_Clube_Bahia_logo.png",
  "Fortaleza": "https://upload.wikimedia.org/wikipedia/commons/4/42/Fortaleza_Esporte_Clube_logo.svg",
  "Athletico Paranaense": "https://upload.wikimedia.org/wikipedia/pt/c/c7/Club_Athletico_Paranaense_2019.png",
  "Atletico Paranaense": "https://upload.wikimedia.org/wikipedia/pt/c/c7/Club_Athletico_Paranaense_2019.png",
  "Bragantino": "https://upload.wikimedia.org/wikipedia/pt/9/9e/RedBullBragantino.png",
  "Bragantino-SP": "https://upload.wikimedia.org/wikipedia/pt/9/9e/RedBullBragantino.png",
  "Cuiaba": "https://upload.wikimedia.org/wikipedia/pt/2/20/Cuiab%C3%A1_EC.png",
  "Coritiba": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Coritiba_FBC_%282006%29.svg/1200px-Coritiba_FBC_%282006%29.svg.png",
  "Goias": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Goi%C3%A1s_Esporte_Clube_logo.svg/1200px-Goi%C3%A1s_Esporte_Clube_logo.svg.png",
  "Santos": "https://upload.wikimedia.org/wikipedia/commons/1/15/Santos_Logo.png",
  "Vitoria": "https://upload.wikimedia.org/wikipedia/pt/9/95/Esporte_Clube_Vit%C3%B3ria_logo.png",
  "Juventude": "https://upload.wikimedia.org/wikipedia/pt/9/99/Esporte_Clube_Juventude_logo.png",
  "Criciuma": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Crici%C3%BAma_Esporte_Clube.svg/1200px-Crici%C3%BAma_Esporte_Clube.svg.png",
  "Atletico Goianiense": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Atl%C3%A9tico_Goianiense.svg/1200px-Atl%C3%A9tico_Goianiense.svg.png"
};


export function getTeamLogoUrl(teamName: string, apiLogoUrl?: string | null): string | null {
  if (apiLogoUrl && apiLogoUrl.trim() !== "") {
    return apiLogoUrl;
  }

  if (LOGO_MAP[teamName]) return LOGO_MAP[teamName];

  const normalized = teamName.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (LOGO_MAP[normalized]) return LOGO_MAP[normalized];

  return null;
}