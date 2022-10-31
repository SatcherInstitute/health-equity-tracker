export const legends = (chartIsSmall: boolean) => {
  return [
    {
      fill: "variables",
      orient: chartIsSmall ? "none" : "top",
      // legendX and legendY are ignored when orient isn't "none"
      legendX: -100,
      legendY: -35,
      font: "inter",
      labelFont: "inter",
      labelLimit: 500,
    },
  ];
};
