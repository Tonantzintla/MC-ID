export type Service = {
  name: string;
  src: string;
  link: string;
  showName?: boolean;
};

export const servicesUsingMCID: Service[] = [
  {
    src: "/assets/images/used-by/MinionAH.png",
    name: "MinionAH",
    link: "https://minionah.com",
    showName: true
  },
  {
    src: "/assets/images/used-by/2B2T Utils.png",
    name: "2B2T Utils",
    link: "https://2b2t.cx/",
    showName: true
  },
  {
    src: "/assets/images/used-by/chub.webp",
    name: "Chub",
    link: "https://discord.gg/collectorshub",
    showName: true
  }
] as const;
