Subject: Repeated connection resets on live manus.space domain while dev preview works

Hello Manus Support,

Please investigate an intermittent but repeatable edge/TLS access problem affecting our published site:

Live domain: https://emlakdash-kcw9r85v.manus.space/
Project: Global 1881 real estate management system

Evidence from Turkey on 11 September 2026:

- At approximately 10:35 TRT, Chrome on a mobile device over Wi-Fi showed ERR_SSL_PROTOCOL_ERROR.
- At approximately 11:07 TRT, with Wi-Fi disabled and mobile 4G/5G enabled, the same live domain showed ERR_CONNECTION_RESET.
- At approximately 11:15 TRT, after clearing Chrome history, the dev preview domain opened successfully over the same GSM connection and displayed the Global 1881 login page.
- At approximately 11:17 TRT, switching back to the live manus.space domain over the same GSM connection again produced ERR_CONNECTION_RESET.
- At approximately 18:16 TRT, with Wi-Fi still disabled and mobile 4G/5G enabled, the normal published hostname again produced ERR_CONNECTION_RESET. The final-dot diagnostic hostname (`emlakdash-kcw9r85v.manus.space.`) reached the platform and returned HTTP 404, which confirms that the device/mobile connection can reach the platform but the normal published hostname is being reset intermittently.

This suggests that the device and mobile connection are generally functional, while the live published hostname or its edge/TLS route may be intermittently resetting the connection. The repeated 18:16 result occurred over GSM, not office Wi-Fi, so this should not be closed as an office-Wi-Fi-only issue. From our server-side checks at approximately 11:19 TRT, both the live domain and dev preview returned HTTP/2 200 from the checking environment; the live domain also completed TLS 1.3 validation. Therefore, the issue may be path-dependent or intermittent.

Please check the edge/TLS routing, certificate/SNI handling, and request logs for this hostname around 10:35–11:17 TRT (UTC+3). We have not changed application code, database data, credentials, or DNS during this investigation. Screenshots showing both error codes are available.

Please confirm whether the published hostname is healthy and whether any edge rule, certificate propagation issue, rate limit, or regional routing problem could explain the difference between the live hostname and the dev preview.

Best regards,
Global 1881
