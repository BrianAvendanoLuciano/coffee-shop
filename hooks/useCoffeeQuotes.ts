"use client";

import { COFFEE_QOUTES } from "@/constants/coffee-qoutes";
import { randomInt } from "@/utils/number";
import { useEffect, useState } from "react";

export const useCoffeeQuote = () => {
  const [quote, setQuote] = useState("");

  useEffect(() => {
    const selectedQuote = COFFEE_QOUTES[randomInt(1, COFFEE_QOUTES.length)];
    setQuote(selectedQuote);
  }, []);

  return quote;
};
