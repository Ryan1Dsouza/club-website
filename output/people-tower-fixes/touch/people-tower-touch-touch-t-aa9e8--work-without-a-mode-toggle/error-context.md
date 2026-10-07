# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: people-tower-touch.spec.mjs >> touch tower at 844x390 >> vertical touch throws and background exploration work without a mode toggle
- Location: tests\browser\people-tower-touch.spec.mjs:114:5

# Error details

```
Error: page.evaluate: TypeError: Cannot read properties of undefined (reading 'matrix')
    at eval (eval at evaluate (:311:30), <anonymous>:6:27)
    at UtilityScript.evaluate (<anonymous>:313:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44)
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - link "Skip to content" [ref=e4] [cursor=pointer]:
    - /url: "#main-content"
  - banner:
    - navigation "Main navigation":
      - generic:
        - generic [ref=e5]:
          - link "Nucleus home" [ref=e6] [cursor=pointer]:
            - /url: /
            - text: Nucleus
          - button "Open menu" [ref=e7] [cursor=pointer]
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
                    - /url: /news
                    - generic [aria-hidden]:
                      - generic: L
                      - generic: i
                      - generic: v
                      - generic: e
                      - generic: "N"
                      - generic: e
                      - generic: w
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
                    - /url: /achievements
                    - generic [aria-hidden]:
                      - generic: A
                      - generic: c
                      - generic: h
                      - generic: i
                      - generic: e
                      - generic: v
                      - generic: e
                      - generic: m
                      - generic: e
                      - generic: "n"
                      - generic: t
                      - generic: s
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
  - main [ref=e11]:
    - generic [ref=e12]:
      - heading "The people behind Nucleus" [level=1] [ref=e13]
      - button "Back to the team" [active] [ref=e15] [cursor=pointer]
      - region "Interactive team tower" [ref=e19]:
        - generic [ref=e21]:
          - generic [aria-hidden] [ref=e22]:
            - generic:
              - generic:
                - generic:
                  - generic:
                    - generic: NUCLEUS / SJEC
                    - generic:
                      - paragraph
                    - generic:
                      - generic: The people / Nucleus
                      - generic: Keep scrolling ↗
          - generic [aria-hidden]:
            - paragraph:
              - text: The
              - emphasis: whole team.
            - generic: Keep throwing, or scroll back to revisit.
          - paragraph: Grab any block. Drag and release to throw. Swipe on the background to meet the team.
          - generic [ref=e24]:
            - generic [ref=e25]:
              - generic [ref=e26]: Jump to a member
              - combobox "Jump to a member" [ref=e27]:
                - option "Meet the members" [disabled] [selected]
                - option "Deona Rego"
                - option "Dinol Castelino"
                - option "Joylin Mathias"
                - option "Karthik"
                - option "Manvitha Lewis"
                - option "Mohit"
                - option "Navya Suvarna"
                - option "Nikhitha Dsouza"
                - option "Nishanth Uday Naik"
                - option "Poorvik Kuthyala"
                - option "Prajwal Gaonkar"
                - option "Rakshith Dsouza"
                - option "Salim Pallikal"
                - option "Aisahath Saniya"
                - option "Sweedan Cardoza"
            - button "Rebuild tower" [ref=e28] [cursor=pointer]
```