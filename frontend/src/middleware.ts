import { defineMiddleware } from "astro:middleware";
import { API_URL_HAPI } from "astro:env/client";

export const onRequest = defineMiddleware(async (context, next) => {
  try {
    console.log("ini middleware");
    console.log(context);
    const { cookies, redirect } = context;
    if(cookies.has("danaSession")){
      const cookie = cookies.get("danaSession").value;
      console.log("Cookie Middleware: ", cookie);
      
      const responseCekCookie = await fetch(`${API_URL_HAPI}/cek-cookie/${cookie}`)
      const resultCekCookie = await responseCekCookie.json();
      console.log(resultCekCookie);
      if(resultCekCookie.status !== "success"){
        return redirect("/");
      }
      return await next();
    }else{
      return redirect("/");
    }
  } catch (e) {
    // Handle errors here
    throw e;
  }
});