import Button from "@/components/button/button";
import Wrapper from "@/components/form/wrapper";
import Input from "@/components/input";
import HeaderText from "@/components/text/headerText";
import Image from "next/image";

import CoffeeImage from "@/public/coffee.png";
import { useCoffeeQuote } from "@/hooks/useCoffeeQuotes";
import { redirect } from "next/navigation";
import { SubmitEvent } from "react";

export default function SignIn() {
  const randomQuote = useCoffeeQuote();

  const handleSubmit = (e: SubmitEvent) => {
    e.preventDefault()
    redirect('/')
  }

  return (
    <>
      <main className="min-h-screen flex flex-col items-center justify-center bg-stone-50">
        <Wrapper>
          <HeaderText text="Enter your credentials" />
          <p className="mt-2 text-sm text-stone-500">
            Welcome back. Please sign in to your account.
          </p>
          <hr className="w-full shadow-border border-stone-200 shadow-sm my-2" />
          <div className="w-full mt-4 flex items-center justify-center flex-col">
            <Image
              src={CoffeeImage}
              alt="Coffee cup"
              height={100}
              width={100}
              className="justify-center items-center"
            />
            <p className="mt-2 text-sm text-center italic text-stone-500">
              {randomQuote}
            </p>
          </div>

          <form className="my-1 w-full" onSubmit={handleSubmit}>
            <div className="my-2">
              <Input name="username" label="Username" placeholder="@user" />
            </div>
            <div className="my-2">
              <Input
                type="password"
                name="password"
                label="Password"
                placeholder="@password"
              />
            </div>
            <div className="mt-4">
              <Button type="submit">Login</Button>
            </div>
          </form>
        </Wrapper>
      </main>
    </>
  );
}
