import { defineMiddleware } from "astro:middleware";
import { API_URL_HAPI } from "astro:env/client";

export const onRequest = defineMiddleware(async (context, next) => {
  try {
    console.log("ini middleware");
    const { cookies, redirect } = context;
    
    if (context.url.pathname === "/" || context.url.pathname === "/verif") {
      return await next();
    }

    // Cek apakah cookie ada
    if (cookies.has("danaSession")) {
      const cookie = cookies.get("danaSession").value;
      console.log("Cookie Middleware: ", cookie);
      
      const responseCekCookie = await fetch(`${API_URL_HAPI}/cek-cookie/${cookie}`);
      const resultCekCookie = await responseCekCookie.json();
      console.log(resultCekCookie);
      
      if (resultCekCookie.status !== "success") {
        return redirect("/"); // Arahkan ke login jika cookie tidak valid
      }
      return await next();
    } else {
      return redirect("/"); // Arahkan ke login jika cookie tidak ada
    }
  } catch (e) {
    console.error("Error di middleware:", e);
    return await next();
  }
});
