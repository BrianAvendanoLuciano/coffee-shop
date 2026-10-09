"use client";

import { COFFEE_QOUTES } from "@/constants/coffee-qoutes";
import { randomInt } from "@/utils/number";
import { useEffect, useState } from "react";

export const useCoffeeQuote = () => {
  const [quote, setQuote] = useState("");

  useEffect(() => {
    const selectedQuote =
      COFFEE_QOUTES[randomInt(0, COFFEE_QOUTES.length - 1)];
    // A random pick during render would differ between the server HTML and
    // the browser, so it has to happen after hydration, in an effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuote(selectedQuote ?? '');
  }, []);

  return quote;
};
