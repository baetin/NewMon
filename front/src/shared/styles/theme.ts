const breakpoints = {
  desktop: 1024,
  tablet: 768,
} as const;

const media = {
  tabletDown: `@media (max-width: ${breakpoints.desktop - 1}px)`,
  mobileDown: `@media (max-width: ${breakpoints.tablet - 1}px)`,
};

export const theme = {
  colors: {
    mainBackground: '#f4f6f8',
    primary: '#162733',
    secondary: '#FA9675',
    background: '#fafafa',
    text: {
      main: '#333333',
      sub: '#777777',
      light: '#FFFFFF',
    },
  },

  fontWeights: {
    regular: 400,
    medium: 500,
    bold: 700,
  },
  breakpoints,
  media,
};
