const reportWebVitals = onPerfEntry => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    // web-vitals v4+ removed getFID, use onINP instead
    import('web-vitals').then((vitals) => {
      if (vitals.getCLS) vitals.getCLS(onPerfEntry);
      if (vitals.getFCP) vitals.getFCP(onPerfEntry);
      if (vitals.getLCP) vitals.getLCP(onPerfEntry);
      if (vitals.getTTFB) vitals.getTTFB(onPerfEntry);
      if (vitals.getINP) vitals.getINP(onPerfEntry); // replaces getFID in v4
    });
  }
};

export default reportWebVitals;
