# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: events-page.spec.mjs >> grid, invitation and book remain accessible on a small phone
- Location: tests\browser\events-page.spec.mjs:124:1

# Error details

```
Error: frame.evaluate: Error: No elements found for include in page Context
    at validateContext (eval at evaluate (:311:30), <anonymous>:19556:15)
    at new Context (eval at evaluate (:311:30), <anonymous>:19537:7)
    at Object._getFrameContexts (eval at evaluate (:311:30), <anonymous>:19578:22)
    at eval (eval at evaluate (:311:30), <anonymous>:4:27)
    at UtilityScript.evaluate (<anonymous>:313:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44)
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - status [ref=e4]: Connecting the dots…
  - generic [ref=e5]:
    - link "Skip to content" [ref=e6] [cursor=pointer]:
      - /url: "#main-content"
    - banner:
      - navigation "Main navigation":
        - generic:
          - generic [ref=e7]:
            - link "Nucleus home" [ref=e8] [cursor=pointer]:
              - /url: /
              - text: Nucleus
            - button "Open menu" [ref=e9] [cursor=pointer]
          - generic [aria-hidden]:
            - generic:
              - generic:
                - list:
                  - listitem:
                    - link:
                      - /url: /
                      - generic [aria-hidden]:
                        - generic: H
                        - generic: o
                        - generic: m
                        - generic: e
                  - listitem:
                    - link:
                      - /url: /events
                      - generic [aria-hidden]:
                        - generic: E
                        - generic: v
                        - generic: e
                        - generic: "n"
                        - generic: t
                        - generic: s
                  - listitem:
                    - link:
                      - /url: /projects
                      - generic [aria-hidden]:
                        - generic: O
                        - generic: u
                        - generic: r
                        - generic: w
                        - generic: o
                        - generic: r
                        - generic: k
                  - listitem:
                    - link:
                      - /url: /team
                      - generic [aria-hidden]:
                        - generic: T
                        - generic: h
                        - generic: e
                        - generic: p
                        - generic: e
                        - generic: o
                        - generic: p
                        - generic: l
                        - generic: e
                - list:
                  - listitem:
                    - link:
                      - /url: https://www.instagram.com/nucleus_sjec/
                      - text: Instagram
                  - listitem:
                    - link:
                      - /url: https://www.linkedin.com/company/nucleus-sjec/
                      - text: LinkedIn
                  - listitem:
                    - link:
                      - /url: https://github.com/nucleus-sjec
                      - text: GitHub
                  - listitem:
                    - link:
                      - /url: mailto:nucleussjec@gmail.com
                      - text: Email
              - generic:
                - generic:
                  - generic: Made of many minds
                  - generic: © 2026 Nucleus SJEC
                - generic:
                  - generic: The community
                  - button: Stay connected
    - main [ref=e13]:
      - region "Nucleus events" [ref=e14]:
        - generic [ref=e15]:
          - generic [ref=e16]:
            - paragraph [ref=e17]: Nucleus / The archive
            - generic [ref=e19]:
              - heading "Events." [level=1] [ref=e20]
              - paragraph [ref=e21]: Small sparks. Lasting connections.Open a chapter of our journey.
            - generic [ref=e22]:
              - generic [ref=e23]: FIELD NOTES / SJEC
              - generic [ref=e24]: 07 CHAPTERS & COUNTING
          - generic [ref=e25]:
            - article [ref=e26]:
              - generic [ref=e27]: STATION 01
              - button "Open Inauguration event book" [ref=e31] [cursor=pointer]:
                - generic [aria-hidden]:
                  - generic:
                    - generic: Inauguration
                    - generic:
                      - generic:
                        - strong: Inauguration
                      - generic: Date to be added · Workshop
                  - generic: Hover Me
            - article [ref=e32]:
              - generic [ref=e33]: STATION 02
              - button "Open Dev event book" [ref=e37] [cursor=pointer]:
                - generic [aria-hidden]:
                  - generic:
                    - generic: Dev
                    - generic:
                      - generic:
                        - strong: Dev
                      - generic: Date to be added · Workshop
                  - generic: Hover Me
            - article [ref=e38]:
              - generic [ref=e39]: STATION 03
              - button "Open Khoj event book" [ref=e43] [cursor=pointer]:
                - generic [aria-hidden]:
                  - generic:
                    - generic: Khoj
                    - generic:
                      - generic:
                        - strong: Khoj
                      - generic: Date to be added · Workshop
                  - generic: Hover Me
            - article [ref=e44]:
              - generic [ref=e45]: STATION 04
              - button "Open LinkedIn event book" [ref=e49] [cursor=pointer]:
                - generic [aria-hidden]:
                  - generic:
                    - generic: LinkedIn
                    - generic:
                      - generic:
                        - strong: LinkedIn
                      - generic: Date to be added · Workshop
                  - generic: Hover Me
            - article [ref=e50]:
              - generic [ref=e51]: STATION 05
              - button "Open n8n event book" [ref=e55] [cursor=pointer]:
                - generic [aria-hidden]:
                  - generic:
                    - generic: n8n
                    - generic:
                      - generic:
                        - strong: n8n
                      - generic: Date to be added · Workshop
                  - generic: Hover Me
            - article [ref=e56]:
              - generic [ref=e57]: STATION 06
              - button "Open Noesis event book" [ref=e61] [cursor=pointer]:
                - generic [aria-hidden]:
                  - generic:
                    - generic: Noesis
                    - generic:
                      - generic:
                        - strong: Noesis
                      - generic: Date to be added · Workshop
                  - generic: Hover Me
            - article [ref=e62]:
              - generic [ref=e63]: STATION 07
              - button "Open Unlocked event book" [ref=e67] [cursor=pointer]:
                - generic [aria-hidden]:
                  - generic:
                    - generic: Unlocked
                    - generic:
                      - generic:
                        - strong: Unlocked
                      - generic: Date to be added · Workshop
                  - generic: Hover Me
            - button "Ride Immersive Experience" [ref=e69] [cursor=pointer]
            - button "Ride Immersive Experience" [ref=e76] [cursor=pointer]
          - generic [ref=e82]:
            - generic [ref=e83]: Hover to discover. Click to relive.
            - generic [ref=e84]: Made of many minds.
```