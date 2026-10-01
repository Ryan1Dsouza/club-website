# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: navbar-before-keyframes.probe.spec.mjs >> reopening replays the stagger after completed and interrupted closes
- Location: tests\browser\morphing-navbar.spec.mjs:65:1

# Error details

```
Error: Expected a visible band stagger after a 75 ms close

expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - link "Skip to content" [ref=e3] [cursor=pointer]:
    - /url: "#main-content"
  - banner:
    - navigation "Main navigation":
      - dialog "Navigation menu":
        - generic [ref=e4]:
          - link "Nucleus home" [ref=e5] [cursor=pointer]:
            - /url: /
            - text: Nucleus
          - button "Close menu" [expanded] [ref=e6] [cursor=pointer]
        - generic [ref=e17]:
          - generic [ref=e18]:
            - list [ref=e19]:
              - listitem [ref=e20]:
                - link "Home" [ref=e21] [cursor=pointer]:
                  - /url: /
                  - generic [aria-hidden] [ref=e23]:
                    - generic [ref=e24]: H
                    - generic [ref=e25]: o
                    - generic [ref=e26]: m
                    - generic [ref=e27]: e
              - listitem [ref=e28]:
                - link "Experiences" [ref=e29] [cursor=pointer]:
                  - /url: /events
                  - generic [aria-hidden] [ref=e30]:
                    - generic [ref=e31]: E
                    - generic [ref=e32]: x
                    - generic [ref=e33]: p
                    - generic [ref=e34]: e
                    - generic [ref=e35]: r
                    - generic [ref=e36]: i
                    - generic [ref=e37]: e
                    - generic [ref=e38]: "n"
                    - generic [ref=e39]: c
                    - generic [ref=e40]: e
                    - generic [ref=e41]: s
              - listitem [ref=e42]:
                - link "Our work" [ref=e43] [cursor=pointer]:
                  - /url: /projects
                  - generic [aria-hidden] [ref=e44]:
                    - generic [ref=e45]: O
                    - generic [ref=e46]: u
                    - generic [ref=e47]: r
                    - generic [ref=e49]: w
                    - generic [ref=e50]: o
                    - generic [ref=e51]: r
                    - generic [ref=e52]: k
              - listitem [ref=e53]:
                - link "The people" [ref=e54] [cursor=pointer]:
                  - /url: /team
                  - generic [aria-hidden] [ref=e55]:
                    - generic [ref=e56]: T
                    - generic [ref=e57]: h
                    - generic [ref=e58]: e
                    - generic [ref=e60]: p
                    - generic [ref=e61]: e
                    - generic [ref=e62]: o
                    - generic [ref=e63]: p
                    - generic [ref=e64]: l
                    - generic [ref=e65]: e
            - list "Social links" [ref=e66]:
              - listitem [ref=e67]:
                - link "Instagram" [ref=e68] [cursor=pointer]:
                  - /url: https://www.instagram.com/nucleus_sjec/
              - listitem [ref=e72]:
                - link "LinkedIn" [ref=e73] [cursor=pointer]:
                  - /url: https://www.linkedin.com/company/nucleus-sjec/
              - listitem [ref=e77]:
                - link "GitHub" [ref=e78] [cursor=pointer]:
                  - /url: https://github.com/nucleus-sjec
              - listitem [ref=e82]:
                - link "Email" [ref=e83] [cursor=pointer]:
                  - /url: mailto:nucleussjec@gmail.com
          - generic [ref=e87]:
            - generic [ref=e88]:
              - generic [ref=e89]: Made of many minds
              - generic [ref=e90]: © 2026 Nucleus SJEC
            - generic [ref=e91]:
              - generic [ref=e92]: The community
              - button "Stay connected" [ref=e93] [cursor=pointer]
  - main [ref=e97]:
    - region "Nucleus" [ref=e98]:
      - heading "Nucleus SJEC — A connection worth making." [level=1] [ref=e99]
      - img "The Nucleus brain logo assembles from a field of luminous particles." [ref=e100]
      - generic:
        - generic "THE NUCLEUS CLUB. CREATE. EXPLORE. INNOVATE":
          - generic [aria-hidden]:
            - generic: EXPLORE
            - generic: INNOVATE
    - region [ref=e102]:
      - generic [ref=e103]:
        - generic [ref=e104]:
          - paragraph [ref=e105]:
            - generic [ref=e106]: Our Domains
            - generic [aria-hidden] [ref=e107]:
              - generic [ref=e108]:
                - generic [ref=e109]: O
                - generic [ref=e110]: u
                - generic [ref=e111]: r
              - generic [ref=e112]:
                - generic [ref=e113]: D
                - generic [ref=e114]: o
                - generic [ref=e115]: m
                - generic [ref=e116]: a
                - generic [ref=e117]: i
                - generic [ref=e118]: "n"
                - generic [ref=e119]: s
          - heading "Three paths. Infinite directions." [level=2] [ref=e120]:
            - generic [ref=e121]:
              - generic [ref=e122]: THREE PATHS.
              - generic [aria-hidden] [ref=e123]:
                - generic [ref=e124]:
                  - generic [ref=e125]: T
                  - generic [ref=e126]: H
                  - generic [ref=e127]: R
                  - generic [ref=e128]: E
                  - generic [ref=e129]: E
                - generic [ref=e130]:
                  - generic [ref=e131]: P
                  - generic [ref=e132]: A
                  - generic [ref=e133]: T
                  - generic [ref=e134]: H
                  - generic [ref=e135]: S
                  - generic [ref=e136]: .
            - generic [ref=e137]:
              - generic [ref=e138]: INFINITE DIRECTIONS.
              - generic [aria-hidden] [ref=e139]:
                - generic [ref=e140]:
                  - generic [ref=e141]: I
                  - generic [ref=e142]: "N"
                  - generic [ref=e143]: F
                  - generic [ref=e144]: I
                  - generic [ref=e145]: "N"
                  - generic [ref=e146]: I
                  - generic [ref=e147]: T
                  - generic [ref=e148]: E
                - generic [ref=e149]:
                  - generic [ref=e150]: D
                  - generic [ref=e151]: I
                  - generic [ref=e152]: R
                  - generic [ref=e153]: E
                  - generic [ref=e154]: C
                  - generic [ref=e155]: T
                  - generic [ref=e156]: I
                  - generic [ref=e157]: O
                  - generic [ref=e158]: "N"
                  - generic [ref=e159]: S
                  - generic [ref=e160]: .
        - region "Artificial Intelligence detail" [ref=e161]:
          - generic [ref=e162]:
            - generic [ref=e177]:
              - generic [ref=e178]: /01
              - heading "Artificial Intelligence" [level=2] [ref=e179]:
                - generic [aria-hidden] [ref=e181]:
                  - generic [ref=e182]: Artificial
                  - generic [ref=e184]: Intelligence
              - paragraph [ref=e186]:
                - generic [ref=e187]: "& Machine Learning"
                - generic [aria-hidden] [ref=e188]:
                  - generic [ref=e189]: "&"
                  - generic [ref=e191]: Machine
                  - generic [ref=e193]: Learning
            - paragraph [ref=e195]:
              - generic [ref=e196]: Explore machine learning, build models, and turn new questions into experiments.
              - generic [aria-hidden] [ref=e197]:
                - generic [ref=e198]: Explore
                - generic [ref=e200]: machine
                - generic [ref=e202]: learning,
                - generic [ref=e204]: build
                - generic [ref=e206]: models,
                - generic [ref=e208]: and
                - generic [ref=e210]: turn
                - generic [ref=e212]: new
                - generic [ref=e214]: questions
                - generic [ref=e216]: into
                - generic [ref=e218]: experiments.
            - generic [ref=e220]:
              - generic [ref=e221]: Intelligence
              - generic [ref=e222]: Research
              - generic [ref=e223]: Possibility
            - generic [ref=e224]:
              - button "Explore domain" [ref=e225] [cursor=pointer]:
                - generic [ref=e226]:
                  - generic [ref=e227]: Explore domain
                  - generic [aria-hidden] [ref=e228]:
                    - generic [ref=e229]:
                      - generic [ref=e230]: E
                      - generic [ref=e231]: x
                      - generic [ref=e232]: p
                      - generic [ref=e233]: l
                      - generic [ref=e234]: o
                      - generic [ref=e235]: r
                      - generic [ref=e236]: e
                    - generic [ref=e237]:
                      - generic [ref=e238]: d
                      - generic [ref=e239]: o
                      - generic [ref=e240]: m
                      - generic [ref=e241]: a
                      - generic [ref=e242]: i
                      - generic [ref=e243]: "n"
              - link "Join WhatsApp Community" [ref=e247] [cursor=pointer]:
                - /url: https://chat.whatsapp.com/F2sg6LBCwibIKWJu2nhnvI
                - generic [ref=e250]:
                  - generic [ref=e251]: Join WhatsApp Community
                  - generic [aria-hidden] [ref=e252]:
                    - generic [ref=e253]: Join
                    - generic [ref=e255]: WhatsApp
                    - generic [ref=e257]: Community
        - region "Web Development detail" [ref=e259]:
          - generic [ref=e260]:
            - generic [ref=e267]:
              - generic [ref=e268]: /02
              - heading "Web Development" [level=2] [ref=e269]:
                - generic [aria-hidden] [ref=e271]:
                  - generic [ref=e272]: Web
                  - generic [ref=e274]: Development
              - paragraph [ref=e276]:
                - generic [ref=e277]: "& Digital Experiences"
                - generic [aria-hidden] [ref=e278]:
                  - generic [ref=e279]: "&"
                  - generic [ref=e281]: Digital
                  - generic [ref=e283]: Experiences
            - paragraph [ref=e285]:
              - generic [ref=e286]: Design thoughtful interfaces. Build useful applications. Put your ideas on the web.
              - generic [aria-hidden] [ref=e287]:
                - generic [ref=e288]: Design
                - generic [ref=e290]: thoughtful
                - generic [ref=e292]: interfaces.
                - generic [ref=e294]: Build
                - generic [ref=e296]: useful
                - generic [ref=e298]: applications.
                - generic [ref=e300]: Put
                - generic [ref=e302]: your
                - generic [ref=e304]: ideas
                - generic [ref=e306]: "on"
                - generic [ref=e308]: the
                - generic [ref=e310]: web.
            - generic [ref=e312]:
              - generic [ref=e313]: Design
              - generic [ref=e314]: Build
              - generic [ref=e315]: Ship
            - generic [ref=e316]:
              - button "Explore domain" [ref=e317] [cursor=pointer]:
                - generic [ref=e318]:
                  - generic [ref=e319]: Explore domain
                  - generic [aria-hidden] [ref=e320]:
                    - generic [ref=e321]:
                      - generic [ref=e322]: E
                      - generic [ref=e323]: x
                      - generic [ref=e324]: p
                      - generic [ref=e325]: l
                      - generic [ref=e326]: o
                      - generic [ref=e327]: r
                      - generic [ref=e328]: e
                    - generic [ref=e329]:
                      - generic [ref=e330]: d
                      - generic [ref=e331]: o
                      - generic [ref=e332]: m
                      - generic [ref=e333]: a
                      - generic [ref=e334]: i
                      - generic [ref=e335]: "n"
              - link "Join WhatsApp Community" [ref=e339] [cursor=pointer]:
                - /url: https://chat.whatsapp.com/L97jBsJl7vJ6ol1k68Ue9L
                - generic [ref=e342]:
                  - generic [ref=e343]: Join WhatsApp Community
                  - generic [aria-hidden] [ref=e344]:
                    - generic [ref=e345]: Join
                    - generic [ref=e347]: WhatsApp
                    - generic [ref=e349]: Community
        - region "Data Structures detail" [ref=e351]:
          - generic [ref=e352]:
            - generic [ref=e360]:
              - generic [ref=e361]: /03
              - heading "Data Structures" [level=2] [ref=e362]:
                - generic [aria-hidden] [ref=e364]:
                  - generic [ref=e365]: Data
                  - generic [ref=e367]: Structures
              - paragraph [ref=e369]:
                - generic [ref=e370]: "& Algorithms"
                - generic [aria-hidden] [ref=e371]:
                  - generic [ref=e372]: "&"
                  - generic [ref=e374]: Algorithms
            - paragraph [ref=e376]:
              - generic [ref=e377]: Find the patterns, solve hard problems, and build a stronger foundation.
              - generic [aria-hidden] [ref=e378]:
                - generic [ref=e379]: Find
                - generic [ref=e381]: the
                - generic [ref=e383]: patterns,
                - generic [ref=e385]: solve
                - generic [ref=e387]: hard
                - generic [ref=e389]: problems,
                - generic [ref=e391]: and
                - generic [ref=e393]: build
                - generic [ref=e395]: a
                - generic [ref=e397]: stronger
                - generic [ref=e399]: foundation.
            - generic [ref=e401]:
              - generic [ref=e402]: Logic
              - generic [ref=e403]: Patterns
              - generic [ref=e404]: Problem-solving
            - generic [ref=e405]:
              - button "Explore domain" [ref=e406] [cursor=pointer]:
                - generic [ref=e407]:
                  - generic [ref=e408]: Explore domain
                  - generic [aria-hidden] [ref=e409]:
                    - generic [ref=e410]:
                      - generic [ref=e411]: E
                      - generic [ref=e412]: x
                      - generic [ref=e413]: p
                      - generic [ref=e414]: l
                      - generic [ref=e415]: o
                      - generic [ref=e416]: r
                      - generic [ref=e417]: e
                    - generic [ref=e418]:
                      - generic [ref=e419]: d
                      - generic [ref=e420]: o
                      - generic [ref=e421]: m
                      - generic [ref=e422]: a
                      - generic [ref=e423]: i
                      - generic [ref=e424]: "n"
              - link "Join WhatsApp Community" [ref=e428] [cursor=pointer]:
                - /url: https://chat.whatsapp.com/LPTqGQdnGRo24BEZyrk9vy
                - generic [ref=e431]:
                  - generic [ref=e432]: Join WhatsApp Community
                  - generic [aria-hidden] [ref=e433]:
                    - generic [ref=e434]: Join
                    - generic [ref=e436]: WhatsApp
                    - generic [ref=e438]: Community
    - generic [ref=e440]:
      - generic [ref=e441]:
        - generic [ref=e442]: JOIN THE COMMUNITY
        - generic [aria-hidden] [ref=e443]:
          - generic [ref=e444]:
            - generic [ref=e445]: J
            - generic [ref=e446]: O
            - generic [ref=e447]: I
            - generic [ref=e448]: "N"
          - generic [ref=e449]:
            - generic [ref=e450]: T
            - generic [ref=e451]: H
            - generic [ref=e452]: E
          - generic [ref=e453]:
            - generic [ref=e454]: C
            - generic [ref=e455]: O
            - generic [ref=e456]: M
            - generic [ref=e457]: M
            - generic [ref=e458]: U
            - generic [ref=e459]: "N"
            - generic [ref=e460]: I
            - generic [ref=e461]: T
            - generic [ref=e462]: "Y"
      - heading "Learn. Build. Collaborate." [level=2] [ref=e463]:
        - generic [ref=e464]:
          - generic [ref=e465]: LEARN. BUILD.
          - generic [aria-hidden] [ref=e466]:
            - generic [ref=e467]:
              - generic [ref=e468]: L
              - generic [ref=e469]: E
              - generic [ref=e470]: A
              - generic [ref=e471]: R
              - generic [ref=e472]: "N"
              - generic [ref=e473]: .
            - generic [ref=e474]:
              - generic [ref=e475]: B
              - generic [ref=e476]: U
              - generic [ref=e477]: I
              - generic [ref=e478]: L
              - generic [ref=e479]: D
              - generic [ref=e480]: .
        - generic [ref=e481]:
          - generic [ref=e482]: COLLABORATE.
          - generic [ref=e484]:
            - generic [ref=e485]: C
            - generic [ref=e486]: O
            - generic [ref=e487]: L
            - generic [ref=e488]: L
            - generic [ref=e489]: A
            - generic [ref=e490]: B
            - generic [ref=e491]: O
            - generic [ref=e492]: R
            - generic [ref=e493]: A
            - generic [ref=e494]: T
            - generic [ref=e495]: E
            - generic [ref=e496]: .
      - paragraph [ref=e497]:
        - generic [ref=e498]: Applications are currently closed. Check out our latest projects and events to see what we're building.
        - generic [aria-hidden] [ref=e499]:
          - generic [ref=e500]: Applications
          - generic [ref=e502]: are
          - generic [ref=e504]: currently
          - generic [ref=e506]: closed.
          - generic [ref=e508]: Check
          - generic [ref=e510]: out
          - generic [ref=e512]: our
          - generic [ref=e514]: latest
          - generic [ref=e516]: projects
          - generic [ref=e518]: and
          - generic [ref=e520]: events
          - generic [ref=e522]: to
          - generic [ref=e524]: see
          - generic [ref=e526]: what
          - generic [ref=e528]: we're
          - generic [ref=e530]: building.
      - generic [ref=e532]:
        - link "JOIN CLUB" [ref=e533] [cursor=pointer]:
          - /url: /recruitment
          - generic [ref=e534]:
            - generic [ref=e535]: JOIN CLUB
            - generic [aria-hidden] [ref=e536]:
              - generic [ref=e537]:
                - generic [ref=e538]: J
                - generic [ref=e539]: O
                - generic [ref=e540]: I
                - generic [ref=e541]: "N"
              - generic [ref=e542]:
                - generic [ref=e543]: C
                - generic [ref=e544]: L
                - generic [ref=e545]: U
                - generic [ref=e546]: B
        - link "PROJECTS" [ref=e550] [cursor=pointer]:
          - /url: /projects
          - generic [ref=e551]:
            - generic [ref=e552]: PROJECTS
            - generic [ref=e554]:
              - generic [ref=e555]: P
              - generic [ref=e556]: R
              - generic [ref=e557]: O
              - generic [ref=e558]: J
              - generic [ref=e559]: E
              - generic [ref=e560]: C
              - generic [ref=e561]: T
              - generic [ref=e562]: S
    - generic [ref=e563]:
      - heading "THE VOICES OF NUCLEUS" [level=2] [ref=e565]:
        - generic [aria-hidden] [ref=e567]:
          - generic [ref=e568]:
            - generic [ref=e569]: T
            - generic [ref=e570]: H
            - generic [ref=e571]: E
          - generic [ref=e572]:
            - generic [ref=e573]: V
            - generic [ref=e574]: O
            - generic [ref=e575]: I
            - generic [ref=e576]: C
            - generic [ref=e577]: E
            - generic [ref=e578]: S
          - generic [ref=e579]:
            - generic [ref=e580]: O
            - generic [ref=e581]: F
          - generic [ref=e582]:
            - generic [ref=e583]: "N"
            - generic [ref=e584]: U
            - generic [ref=e585]: C
            - generic [ref=e586]: L
            - generic [ref=e587]: E
            - generic [ref=e588]: U
            - generic [ref=e589]: S
      - generic [ref=e590]:
        - generic [ref=e591]:
          - generic [ref=e592]:
            - generic [ref=e594]:
              - paragraph [ref=e595]: Ken Masters
              - paragraph [ref=e596]: "@kmasters"
            - paragraph [ref=e597]: “Our productivity has nearly doubled since onboarding. Automation features removed repetitive tasks, allowing our team to focus on building instead of managing operations.”
          - generic [ref=e598]:
            - generic [ref=e600]:
              - paragraph [ref=e601]: Kira Athrun
              - paragraph [ref=e602]: "@kathrun"
            - paragraph [ref=e603]: “What surprised us most was how quickly our team adapted. Minimal learning curve, excellent documentation, and powerful features make it a must-have for modern SaaS companies.”
          - generic [ref=e604]:
            - generic [ref=e606]:
              - paragraph [ref=e607]: Lirael Nassun
              - paragraph [ref=e608]: "@lnassun"
            - paragraph [ref=e609]: “This is easily one of the most reliable SaaS tools we’ve adopted. The UI is intuitive, integrations are seamless, and it saves us countless hours every week.”
          - generic [ref=e610]:
            - generic [ref=e612]:
              - paragraph [ref=e613]: Jessica
              - paragraph [ref=e614]: "@jessica"
            - paragraph [ref=e615]: “Switching to this platform streamlined our entire workflow. Setup was effortless, performance improved instantly, and our team now ships features faster without worrying about infrastructure.”
          - generic [ref=e616]:
            - generic [ref=e618]:
              - paragraph [ref=e619]: Jenny
              - paragraph [ref=e620]: "@jenny"
            - paragraph [ref=e621]: “We evaluated multiple solutions, but this stood out immediately. It’s fast, scalable, and thoughtfully designed for growing teams that need stability without added complexity.”
        - generic [aria-hidden] [ref=e622]:
          - generic [ref=e623]:
            - generic [ref=e625]:
              - paragraph [ref=e626]: Ken Masters
              - paragraph [ref=e627]: "@kmasters"
            - paragraph [ref=e628]: “Our productivity has nearly doubled since onboarding. Automation features removed repetitive tasks, allowing our team to focus on building instead of managing operations.”
          - generic [ref=e629]:
            - generic [ref=e631]:
              - paragraph [ref=e632]: Kira Athrun
              - paragraph [ref=e633]: "@kathrun"
            - paragraph [ref=e634]: “What surprised us most was how quickly our team adapted. Minimal learning curve, excellent documentation, and powerful features make it a must-have for modern SaaS companies.”
          - generic [ref=e635]:
            - generic [ref=e637]:
              - paragraph [ref=e638]: Lirael Nassun
              - paragraph [ref=e639]: "@lnassun"
            - paragraph [ref=e640]: “This is easily one of the most reliable SaaS tools we’ve adopted. The UI is intuitive, integrations are seamless, and it saves us countless hours every week.”
          - generic [ref=e641]:
            - generic [ref=e643]:
              - paragraph [ref=e644]: Jessica
              - paragraph [ref=e645]: "@jessica"
            - paragraph [ref=e646]: “Switching to this platform streamlined our entire workflow. Setup was effortless, performance improved instantly, and our team now ships features faster without worrying about infrastructure.”
          - generic [ref=e647]:
            - generic [ref=e649]:
              - paragraph [ref=e650]: Jenny
              - paragraph [ref=e651]: "@jenny"
            - paragraph [ref=e652]: “We evaluated multiple solutions, but this stood out immediately. It’s fast, scalable, and thoughtfully designed for growing teams that need stability without added complexity.”
      - generic [ref=e653]:
        - generic [ref=e654]:
          - generic [ref=e655]:
            - generic [ref=e657]:
              - paragraph [ref=e658]: Jenny
              - paragraph [ref=e659]: "@jenny"
            - paragraph [ref=e660]: “We evaluated multiple solutions, but this stood out immediately. It’s fast, scalable, and thoughtfully designed for growing teams that need stability without added complexity.”
          - generic [ref=e661]:
            - generic [ref=e663]:
              - paragraph [ref=e664]: Jessica
              - paragraph [ref=e665]: "@jessica"
            - paragraph [ref=e666]: “Switching to this platform streamlined our entire workflow. Setup was effortless, performance improved instantly, and our team now ships features faster without worrying about infrastructure.”
          - generic [ref=e667]:
            - generic [ref=e669]:
              - paragraph [ref=e670]: Lirael Nassun
              - paragraph [ref=e671]: "@lnassun"
            - paragraph [ref=e672]: “This is easily one of the most reliable SaaS tools we’ve adopted. The UI is intuitive, integrations are seamless, and it saves us countless hours every week.”
          - generic [ref=e673]:
            - generic [ref=e675]:
              - paragraph [ref=e676]: Kira Athrun
              - paragraph [ref=e677]: "@kathrun"
            - paragraph [ref=e678]: “What surprised us most was how quickly our team adapted. Minimal learning curve, excellent documentation, and powerful features make it a must-have for modern SaaS companies.”
          - generic [ref=e679]:
            - generic [ref=e681]:
              - paragraph [ref=e682]: Ken Masters
              - paragraph [ref=e683]: "@kmasters"
            - paragraph [ref=e684]: “Our productivity has nearly doubled since onboarding. Automation features removed repetitive tasks, allowing our team to focus on building instead of managing operations.”
        - generic [aria-hidden] [ref=e685]:
          - generic [ref=e686]:
            - generic [ref=e688]:
              - paragraph [ref=e689]: Jenny
              - paragraph [ref=e690]: "@jenny"
            - paragraph [ref=e691]: “We evaluated multiple solutions, but this stood out immediately. It’s fast, scalable, and thoughtfully designed for growing teams that need stability without added complexity.”
          - generic [ref=e692]:
            - generic [ref=e694]:
              - paragraph [ref=e695]: Jessica
              - paragraph [ref=e696]: "@jessica"
            - paragraph [ref=e697]: “Switching to this platform streamlined our entire workflow. Setup was effortless, performance improved instantly, and our team now ships features faster without worrying about infrastructure.”
          - generic [ref=e698]:
            - generic [ref=e700]:
              - paragraph [ref=e701]: Lirael Nassun
              - paragraph [ref=e702]: "@lnassun"
            - paragraph [ref=e703]: “This is easily one of the most reliable SaaS tools we’ve adopted. The UI is intuitive, integrations are seamless, and it saves us countless hours every week.”
          - generic [ref=e704]:
            - generic [ref=e706]:
              - paragraph [ref=e707]: Kira Athrun
              - paragraph [ref=e708]: "@kathrun"
            - paragraph [ref=e709]: “What surprised us most was how quickly our team adapted. Minimal learning curve, excellent documentation, and powerful features make it a must-have for modern SaaS companies.”
          - generic [ref=e710]:
            - generic [ref=e712]:
              - paragraph [ref=e713]: Ken Masters
              - paragraph [ref=e714]: "@kmasters"
            - paragraph [ref=e715]: “Our productivity has nearly doubled since onboarding. Automation features removed repetitive tasks, allowing our team to focus on building instead of managing operations.”
  - contentinfo [ref=e716]:
    - generic [ref=e717]:
      - link "Nucleus home" [ref=e718] [cursor=pointer]:
        - /url: /
        - generic [ref=e721]:
          - text: NUCLEUS
          - generic [ref=e722]: SJEC · MANGALURU
      - generic [ref=e723]:
        - link "Nucleus Instagram" [ref=e724] [cursor=pointer]:
          - /url: https://www.instagram.com/nucleus_sjec/
        - link "Nucleus LinkedIn" [ref=e728] [cursor=pointer]:
          - /url: https://www.linkedin.com/company/nucleus-sjec/
        - link "Nucleus GitHub" [ref=e733] [cursor=pointer]:
          - /url: https://github.com/nucleus-sjec
        - link "Email Nucleus" [ref=e737] [cursor=pointer]:
          - /url: mailto:nucleussjec@gmail.com
    - generic [ref=e741]:
      - generic [ref=e742]: © 2026 Nucleus SJEC
      - generic [ref=e743]: Made of many minds.
      - link "Admin" [ref=e744] [cursor=pointer]:
        - /url: /admin
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import { readFile, mkdir } from 'node:fs/promises';
  3   | 
  4   | const site = JSON.parse(await readFile(new URL('../../shared/public-data.json', import.meta.url), 'utf8'));
  5   | const destinations = [['Home', '/'], ['Experiences', '/events'], ['Our work', '/projects'], ['The people', '/team']];
  6   | await mkdir('output/navbar-match', { recursive: true });
  7   | 
  8   | test.beforeEach(async ({ page }) => {
  9   |   await page.route('**/api/site', route => route.fulfill({ json: site }));
  10  | });
  11  | const menu = page => page.getByRole('navigation', { name: 'Main navigation' });
  12  | const toggle = page => page.locator('.morph-nav__toggle');
  13  | async function settledOpen(page) {
  14  |   await expect(page.locator('.morph-nav__links li').last()).toHaveCSS('opacity', '1');
  15  |   await expect(page.locator('.morph-nav__overlay')).toHaveCSS('transform', 'none');
  16  | }
  17  | 
  18  | test('reference layout keeps a centered pill and reveals a full-screen menu in five bands', async ({ page }) => {
  19  |   const errors = [];
  20  |   page.on('pageerror', error => errors.push(error.message));
  21  |   await page.setViewportSize({ width: 1440, height: 900 });
  22  |   await page.goto('/');
  23  |   await expect(page.locator('.logo-landing')).toHaveAttribute('data-text-ready', 'true', { timeout: 15000 });
  24  |   const pill = page.locator('.morph-nav__pill');
  25  |   const closed = await pill.boundingBox();
  26  |   expect(Math.abs(closed.x + closed.width / 2 - 720)).toBeLessThan(1);
  27  |   expect(closed.y).toBe(16);
  28  |   expect(closed.height).toBe(58);
  29  |   await page.screenshot({ path: 'output/navbar-match/desktop-closed.png' });
  30  |   await page.evaluate(() => {
  31  |     window.navFrames = [];
  32  |     const begin = performance.now();
  33  |     const sample = () => {
  34  |       window.navFrames.push({
  35  |         bands: [...document.querySelectorAll('.morph-nav__band')].map(band => band.getBoundingClientRect().x),
  36  |         text: Number(getComputedStyle(document.querySelector('.morph-nav__links li')).opacity),
  37  |       });
  38  |       if (performance.now() - begin < 2400) requestAnimationFrame(sample);
  39  |     };
  40  |     requestAnimationFrame(sample);
  41  |   });
  42  |   await toggle(page).click();
  43  |   await page.waitForTimeout(250);
  44  |   await page.screenshot({ path: 'output/navbar-match/desktop-opening.png' });
  45  |   await settledOpen(page);
  46  |   await expect(page.locator('.morph-nav__footer > div').last()).toHaveCSS('opacity', '1');
  47  |   expect(await pill.boundingBox()).toEqual(closed);
  48  |   const frames = await page.evaluate(() => window.navFrames);
  49  |   expect(frames.some(frame => frame.bands[0] > 10 && frame.bands[0] < 1300 && frame.bands[4] > frame.bands[0] + 100 && frame.text < .1)).toBe(true);
  50  |   const overlay = await page.locator('.morph-nav__overlay').boundingBox();
  51  |   expect(overlay).toEqual({ x: 0, y: 0, width: 1440, height: 900 });
  52  |   await expect(page.locator('.morph-nav__links .morph-nav__link')).toHaveCount(4);
  53  |   expect(await page.locator('.morph-nav__links').evaluate(element => parseFloat(getComputedStyle(element).fontSize))).toBeGreaterThan(100);
  54  |   await expect(menu(page).getByRole('link', { name: 'Home', exact: true })).toHaveAttribute('aria-current', 'page');
  55  |   await page.screenshot({ path: 'output/navbar-match/desktop-open.png' });
  56  |   await menu(page).getByRole('link', { name: 'Our work', exact: true }).hover();
  57  |   await page.waitForTimeout(120);
  58  |   await page.screenshot({ path: 'output/navbar-match/desktop-hover.png' });
  59  |   await toggle(page).click();
  60  |   await expect(page.locator('.morph-nav__overlay')).toHaveAttribute('inert');
  61  |   await expect.poll(async () => Math.round((await page.locator('.morph-nav__overlay').boundingBox()).x)).toBe(1440);
  62  |   expect(errors).toEqual([]);
  63  | });
  64  | 
  65  | test('reopening replays the stagger after completed and interrupted closes', async ({ page }, testInfo) => {
  66  |   await page.emulateMedia({ reducedMotion: 'no-preference' });
  67  |   await page.setViewportSize({ width: 1440, height: 900 });
  68  |   await page.goto('/');
  69  |   await expect(page.locator('.logo-landing')).toHaveAttribute('data-text-ready', 'true', { timeout: 15000 });
  70  | 
  71  |   for (const closeDelay of [null, 2000, 75, 300]) {
  72  |     if (closeDelay !== null) {
  73  |       await toggle(page).dispatchEvent('click');
  74  |       await page.waitForTimeout(closeDelay);
  75  |     }
  76  |     await page.evaluate(() => {
  77  |       window.reopenFrames = [];
  78  |       const sample = () => {
  79  |         const bands = [...document.querySelectorAll('.morph-nav__band')].map(band => band.getBoundingClientRect().x);
  80  |         window.reopenFrames.push({
  81  |           bands,
  82  |           lastBandOffset: bands[4] - document.querySelector('.morph-nav__overlay').getBoundingClientRect().x,
  83  |           text: Number(getComputedStyle(document.querySelector('.morph-nav__links li')).opacity),
  84  |         });
  85  |         window.reopenFrameId = requestAnimationFrame(sample);
  86  |       };
  87  |       window.reopenFrameId = requestAnimationFrame(sample);
  88  |     });
  89  |     await toggle(page).dispatchEvent('click');
  90  |     await settledOpen(page);
  91  |     const frames = await page.evaluate(() => {
  92  |       cancelAnimationFrame(window.reopenFrameId);
  93  |       return window.reopenFrames;
  94  |     });
  95  |     await testInfo.attach(`sweep-after-${closeDelay ?? 'initial'}-close`, { body: JSON.stringify(frames), contentType: 'application/json' });
  96  |     expect(frames.some(frame => frame.bands[0] > 10 && frame.bands[0] < 1300 &&
  97  |       frame.bands[4] > frame.bands[0] + 100 && frame.lastBandOffset > 1439 && frame.text < .1),
  98  |     closeDelay === null ? 'Expected a visible band stagger on first open' :
> 99  |       `Expected a visible band stagger after a ${closeDelay} ms close`).toBe(true);
      |                                                                         ^ Error: Expected a visible band stagger after a 75 ms close
  100 |   }
  101 | });
  102 | 
  103 | test('keyboard focus stays in the full-screen menu and Escape restores the page', async ({ page }) => {
  104 |   await page.goto('/recruitment');
  105 |   await toggle(page).focus();
  106 |   await page.keyboard.press('Enter');
  107 |   await settledOpen(page);
  108 |   await expect(page.getByRole('dialog', { name: 'Navigation menu' })).toBeVisible();
  109 |   await expect(page.locator('main')).toHaveAttribute('inert');
  110 |   await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
  111 |   for (const [title] of destinations) {
  112 |     await page.keyboard.press('Tab');
  113 |     await expect(menu(page).getByRole('link', { name: title, exact: true })).toBeFocused();
  114 |   }
  115 |   for (const title of ['Instagram', 'LinkedIn', 'GitHub', 'Email']) {
  116 |     await page.keyboard.press('Tab');
  117 |     await expect(menu(page).getByRole('link', { name: title, exact: true })).toBeFocused();
  118 |   }
  119 |   await page.keyboard.press('Tab');
  120 |   await expect(page.locator('.morph-nav__join')).toBeFocused();
  121 |   await page.keyboard.press('Tab');
  122 |   await expect(page.locator('.morph-nav__brand')).toBeFocused();
  123 |   await page.keyboard.press('Shift+Tab');
  124 |   await expect(page.locator('.morph-nav__join')).toBeFocused();
  125 |   await page.keyboard.press('Escape');
  126 |   await expect(toggle(page)).toBeFocused();
  127 |   await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false');
  128 |   await expect(page.locator('main')).not.toHaveAttribute('inert');
  129 |   await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  130 |   await expect(menu(page).getByRole('link', { name: 'Home', exact: true })).toHaveCount(0);
  131 | });
  132 | 
  133 | test('routes, social destinations, reduced motion, and the community action remain functional', async ({ page }) => {
  134 |   await page.emulateMedia({ reducedMotion: 'reduce' });
  135 |   await page.goto('/recruitment');
  136 |   for (const [title, path] of destinations) {
  137 |     await toggle(page).click();
  138 |     await menu(page).getByRole('link', { name: title, exact: true }).click();
  139 |     await expect(page).toHaveURL(url => url.pathname === path);
  140 |     await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false');
  141 |     await expect(page.locator('main')).not.toHaveAttribute('inert');
  142 |     await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  143 |     await toggle(page).click();
  144 |     await expect(menu(page).getByRole('link', { name: title, exact: true })).toHaveAttribute('aria-current', 'page');
  145 |     await expect(page.locator('.morph-nav__overlay')).toHaveCSS('transform', 'none');
  146 |     await expect(page.locator('.morph-nav__letter').first()).toHaveCSS('animation-name', 'none');
  147 |     await toggle(page).click();
  148 |   }
  149 |   await toggle(page).click();
  150 |   await expect(menu(page).getByRole('link', { name: 'Instagram', exact: true })).toHaveAttribute('href', site.settings.instagramUrl);
  151 |   await expect(menu(page).getByRole('link', { name: 'LinkedIn', exact: true })).toHaveAttribute('href', site.settings.linkedinUrl);
  152 |   await expect(menu(page).getByRole('link', { name: 'GitHub', exact: true })).toHaveAttribute('href', site.settings.githubUrl);
  153 |   await page.locator('.morph-nav__join').click();
  154 |   await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false');
  155 |   await expect(page.locator('dialog.modal')).toBeVisible();
  156 |   await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
  157 |   await page.getByRole('button', { name: 'Close dialog', exact: true }).click();
  158 |   await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  159 |   await expect(toggle(page)).toBeFocused();
  160 |   await toggle(page).click();
  161 |   await page.goBack();
  162 |   await expect(page).toHaveURL(/\/projects$/);
  163 |   await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false');
  164 | });
  165 | 
  166 | test('mobile and landscape menus fit long labels and keep every action reachable', async ({ browser }) => {
  167 |   const context = await browser.newContext({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  168 |   const page = await context.newPage();
  169 |   await page.route('**/api/site', route => route.fulfill({ json: site }));
  170 |   await page.goto('/events');
  171 |   for (const viewport of [{ width: 390, height: 844 }, { width: 280, height: 653 }, { width: 844, height: 390 }]) {
  172 |     await page.setViewportSize(viewport);
  173 |     await toggle(page).tap();
  174 |     await settledOpen(page);
  175 |     const pill = await page.locator('.morph-nav__pill').boundingBox();
  176 |     expect(Math.abs(pill.x + pill.width / 2 - viewport.width / 2)).toBeLessThan(1);
  177 |     for (const title of await page.locator('.morph-nav__title').all()) {
  178 |       const box = await title.boundingBox();
  179 |       expect(box.x).toBeGreaterThanOrEqual(0);
  180 |       expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
  181 |       await expect(title).toBeInViewport();
  182 |     }
  183 |     await expect(page.locator('.morph-nav__join')).toBeInViewport();
  184 |     expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(viewport.width);
  185 |     await page.screenshot({ path: 'output/navbar-match/mobile-' + viewport.width + '-open.png' });
  186 |     await toggle(page).tap();
  187 |     await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false');
  188 |   }
  189 |   await context.close();
  190 | });
  191 | 
  192 | test('opening from a scrolled page locks the background and rapid toggles recover cleanly', async ({ page }) => {
  193 |   await page.goto('/');
  194 |   await expect(page.locator('html')).toHaveClass(/lenis/);
  195 |   await page.mouse.move(20, 450);
  196 |   await page.mouse.wheel(0, 600);
  197 |   await expect.poll(() => page.evaluate(() => scrollY)).toBe(360);
  198 |   await toggle(page).click();
  199 |   await settledOpen(page);
```