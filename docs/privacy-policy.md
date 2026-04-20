---
layout: default
title: stocktrace — Privacy Policy
permalink: /privacy/
---

# stocktrace — Privacy Policy

_Last updated: {{ "now" | date: "%B %d, %Y" }}_

This privacy policy describes how the **stocktrace** Android app and its
companion web app (together, "the Service") collect, use, and share information.
stocktrace is operated by the developer listed at the bottom of this page.

## 1. Information we collect

When you use stocktrace you actively provide us with:

| Data | Why it is collected | Where it is stored |
|------|---------------------|---------------------|
| Email address + display name | Account identification and sign-in | Our server database |
| Password (hashed) | Sign-in. We never store your password in plaintext; only a bcrypt hash. | Our server database |
| Broker credentials (Zerodha API key/secret, 5paisa email/password/TOTP secret/encryption keys) | Placing orders on your behalf through the broker you explicitly connect | Our server database, encrypted at rest |
| Broker-issued access tokens and JWTs | Maintaining your broker session during the trading day | Our server database; expires automatically |
| Chartink alerts delivered to your account | Showing you the live stocks feed | Transient; kept in memory / short-lived storage |

We also automatically collect minimal technical information:

- HTTP request logs (IP address, path, status code, timestamp) for security and
  abuse detection. Retained for up to 30 days.
- Basic device info reported by the app runtime (OS version, app version) for
  crash diagnosis.

We do **not** use third-party analytics, advertising, or tracking SDKs. We do
not sell or rent your data to anyone.

## 2. How we use your information

We use the information above strictly to provide the Service:

- Authenticate you and keep you signed in.
- Forward trade instructions from the app to your chosen broker (Zerodha,
  5paisa).
- Deliver real-time Chartink alerts to your authenticated session.
- Allow an administrator to approve new sign-ups.
- Detect and block abuse of the Service.

We do not use your data for advertising, profiling, or any purpose outside the
Service.

## 3. Sharing

We share information only with the broker you explicitly connect, and only the
specific fields each broker's API requires to place orders on your behalf. We
do not share your data with any other third party except:

- When required by law, court order, or a valid law-enforcement request.
- With our hosting and infrastructure providers (e.g. VPS operator, TLS
  certificate authority) to the extent strictly necessary to run the Service.

## 4. Security

- Passwords are stored only as bcrypt hashes.
- Broker credentials are encrypted at rest.
- All network traffic to our server is served over HTTPS (TLS 1.2+).
- Access to the production database and servers is restricted to the developer.

Despite these measures, no online service can guarantee absolute security. You
are responsible for keeping your device and sign-in credentials secure.

## 5. Data retention and deletion

- Your account is retained until you ask us to delete it.
- Broker access tokens auto-expire daily and are replaced on each "TradeOn"
  session.
- To delete your account and all associated broker credentials, email the
  address below from the email you registered with. We will delete your data
  within 30 days of the request.

## 6. Children

The Service is not directed at children under 13 and we do not knowingly
collect personal information from children. If you believe a child has provided
us data, contact us and we will delete it.

## 7. Your rights

Depending on your jurisdiction you may have rights to access, correct, export,
or delete the personal data we hold about you. Email the contact address below
to exercise any of these rights.

## 8. Changes to this policy

We will post any changes to this page and update the "Last updated" date. If
the changes are material we will also attempt to notify you in the app before
the changes take effect.

## 9. Contact

Questions, complaints, or deletion requests:

**Email:** [sivarameee246@gmail.com](mailto:sivarameee246@gmail.com)

---

If you are viewing this from the Google Play Store listing, the policy at this
URL is the authoritative version.
