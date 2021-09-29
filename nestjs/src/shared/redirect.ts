export function redirectPage(url: string) {
	return (`<html><head>
	<meta charset="utf-8">
	<title>Redirecting</title>
	<base href="/">
	<meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="background-color: #1C768F; display: flex; place-content: center; place-items: center;" >
  <div style="padding: 2rem; width: 30rem; height 4rem; background-color: white; border-radius: 2rem; display: flex; flex-direction: column; place-content: center; place-items: center;" >
	<p style="font-size: 34px; font-family: 'Arial'; color: #24485C; font-weight: regular; margin: auto;">
      You are being redirected
    </p>
  <p style="font-family: 'Arial'; color: #24485C; margin: auto; margin-bottom: 0.5rem;">If you aren’t redirected, press the button below.</p>
  <button style="color: white; outline: none; border: none; border-radius: 12px; background-color: #51D2EE; width: 12rem; height: 5rem; font-family: 'Poppins'; font-size: 18px; margin-bottom: 1rem; " onclick="redirect()">Redirect</button>      
  </div>
  <script>
  var toRedirect = "${url}";
  function redirect() {
	window.location.href = toRedirect;
  }
  window.addEventListener("load", redirect);
  redirect();
  </script>
</body>
</html>
`);
}