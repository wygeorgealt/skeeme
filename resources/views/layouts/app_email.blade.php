<!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en-US">

<head>
	<title>{{ $title ?? 'Skeeme AI' }}</title>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<link href="https://fonts.googleapis.com/css2?family=Orbit&display=swap" rel="stylesheet" type="text/css">
	<link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400..700;1,400..700&display=swap" rel="stylesheet" type="text/css">
	<style>
		* { box-sizing: border-box; }
		body { margin: 0; padding: 0; background-color: #0c0914; font-family: 'Instrument Sans', Helvetica, Arial, sans-serif; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
		p { line-height: 1.6; margin: 0; }
		.button-hover:hover { opacity: 0.9 !important; }
        @media screen and (max-width: 640px) {
            .container { width: 100% !important; }
            .hero-h1 { font-size: 32px !important; }
            .hero-padding { padding-left: 20px !important; padding-right: 20px !important; padding-top: 30px !important; }
            .content-padding { padding-left: 20px !important; padding-right: 20px !important; padding-bottom: 30px !important; }
            .footer-padding { padding: 30px 20px !important; }
        }
	</style>
</head>

<body style="background-color: #0c0914; margin: 0; padding: 20px 0;">

	<!-- NAV BAR -->
	<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
		<tbody><tr><td>
			<table align="center" class="container" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #1a1625; border-radius: 12px 12px 0 0; color: #ffffff; padding-left: 40px; padding-right: 40px; padding-top: 15px; padding-bottom: 15px; width: 640px; margin: 0 auto;" width="640">
				<tbody><tr><td>
					<table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
						<tbody><tr>
							<td width="100%" style="font-weight: 400; text-align: center; vertical-align: middle;">
								<div style="padding: 10px 0;">
									<img src="{{ asset('images/skeemeword.png') }}" width="160" alt="Skeeme" style="display: inline-block;">
								</div>
							</td>
						</tr></tbody>
					</table>
				</td></tr></tbody>
			</table>
		</td></tr></tbody>
	</table>

	<!-- HERO SECTION -->
	<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
		<tbody><tr><td>
			<table align="center" class="container" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #8B5CF6; border-radius: 0; color: #ffffff; width: 640px; margin: 0 auto;" width="640">
				<tbody><tr>
					<td class="hero-padding" style="font-weight: 400; text-align: left; vertical-align: top; padding: 40px 40px 0;">
						<!-- Label -->
						<h2 style="margin: 0 0 12px; color: #0c0914; font-family: 'Orbit', Helvetica, sans-serif; font-size: 12px; font-weight: 800; letter-spacing: 2px; line-height: 1.2; text-align: center; text-transform: uppercase; opacity: 0.9;">@yield('hero-label', 'Next-Gen Learning Assistant')</h2>

						<!-- Headline -->
						<h1 class="hero-h1" style="margin: 0 0 32px; color: #0c0914; font-family: 'Instrument Sans', Helvetica, sans-serif; font-size: 44px; font-weight: 800; letter-spacing: -1.5px; line-height: 1.1; text-align: center;">@yield('hero-title')</h1>

						<!-- Hero graphic placeholder -->
						<div style="background: #0c0914; border-radius: 16px; height: 240px; display: flex; align-items: center; justify-content: center; margin: 0 auto 40px; overflow: hidden; position: relative; border: 1px solid rgba(255,255,255,0.1);">
							<div style="position: absolute; inset: 0; background: linear-gradient(135deg, #0c0914 0%, #1a1625 50%, #0c0914 100%);"></div>
							<div style="position: relative; z-index: 1; text-align: center;">
								<div style="width: 72px; height: 72px; background: #8B5CF6; border-radius: 20px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 30px rgba(139, 92, 246, 0.4);">
									@yield('hero-icon')
								</div>
								<p style="color: #8B5CF6; font-family: 'Orbit', Helvetica, sans-serif; font-size: 14px; font-weight: 800; margin: 0; letter-spacing: 2px; text-transform: uppercase;">@yield('hero-subtitle')</p>
							</div>
						</div>
					</td>
				</tr></tbody>
			</table>
		</td></tr></tbody>
	</table>

	<!-- BODY CONTENT -->
	<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
		<tbody><tr><td>
			<table align="center" class="container" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #8B5CF6; width: 640px; margin: 0 auto;" width="640">
				<tbody><tr>
					<td class="content-padding" style="padding: 0 60px 40px;">
						@yield('main-content')
					</td>
				</tr></tbody>
			</table>
		</td></tr></tbody>
	</table>

	<!-- FOOTER SECTION -->
	<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
		<tbody><tr><td>
			<table align="center" class="container" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #1a1625; width: 640px; margin: 0 auto; border-radius: 0 0 12px 12px; border-top: 1px solid rgba(255,255,255,0.05);" width="640">
				<tbody><tr>
					<td class="footer-padding" style="padding: 40px; text-align: center;">
						<div style="padding-bottom: 20px; text-align: center;">
                            <img src="{{ asset('images/skeemeword.png') }}" width="140" alt="Skeeme" style="display: inline-block; filter: brightness(0.2);">
                        </div>
						<p style="color: #ffffff; font-family: 'Orbit', Helvetica, sans-serif; font-size: 11px; letter-spacing: 2.5px; margin: 0; text-transform: uppercase; opacity: 0.6;">Redefining Academic Excellence with AI</p>

                        <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin-top: 32px; width: 100%;">
                            <tr>
                                <td style="text-align: left; color: #94A3B8; font-size: 13px; line-height: 1.8;">
                                    © {{ date('Y') }} Skeeme AI. All Rights Reserved.<br>
                                    Lagos, Nigeria | Abuja, Nigeria
                                </td>
                                <td style="text-align: right; vertical-align: top;">
                                    <a href="#" style="color: #8B5CF6; font-size: 13px; text-decoration: none; font-weight: 600;">Unsubscribe</a><br>
                                    <a href="#" style="color: #8B5CF6; font-size: 13px; text-decoration: none; font-weight: 600;">Privacy Policy</a>
                                </td>
                            </tr>
                        </table>
					</td>
				</tr></tbody>
			</table>
		</td></tr></tbody>
	</table>

	<div style="height: 40px;"></div>

</body>
</html>
