# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: bookings.spec.ts >> Booking Creation & Concurrency Exclusions >> should trigger double click protection on booking save
- Location: tests\e2e\bookings.spec.ts:38:3

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

```
Test timeout of 30000ms exceeded.
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e6]:
    - generic [ref=e7]:
      - img "VenuePro Logo" [ref=e8]
      - paragraph [ref=e9]: Premium Indian Venue Management System
    - generic [ref=e10]:
      - heading "Sign In" [level=2] [ref=e11]
      - generic [ref=e12]:
        - generic [ref=e13]:
          - generic [ref=e14]: Email Address
          - generic [ref=e15]:
            - img [ref=e16]
            - textbox "name@venue.com" [ref=e19]: owner@venuepro.com
        - generic [ref=e20]:
          - generic [ref=e21]: Password
          - generic [ref=e22]:
            - img [ref=e23]
            - textbox "••••••••" [active] [ref=e26]: password123
            - button [ref=e27] [cursor=pointer]:
              - img [ref=e28]
        - button "Sign In" [ref=e31] [cursor=pointer]:
          - generic [ref=e32]: Sign In
      - generic [ref=e33]:
        - text: Don't have an account?
        - link "Create one now" [ref=e34]:
          - /url: /signup
    - generic [ref=e35]:
      - img [ref=e36]
      - generic [ref=e39]: Secured with Supabase SSL/TLS • Row-Level Access Policies
  - button "Feedback" [ref=e41] [cursor=pointer]:
    - img [ref=e42]
    - generic: Feedback
  - region "Notifications alt+T"
```