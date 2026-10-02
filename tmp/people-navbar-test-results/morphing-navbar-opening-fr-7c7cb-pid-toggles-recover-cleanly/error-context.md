# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: morphing-navbar.spec.mjs >> opening from a scrolled page locks the background and rapid toggles recover cleanly
- Location: tests\browser\morphing-navbar.spec.mjs:251:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 360
Received: 0

Call Log:
- Timeout 5000ms exceeded while waiting on the predicate
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
                      - generic: x
                      - generic: p
                      - generic: e
                      - generic: r
                      - generic: i
                      - generic: e
                      - generic: "n"
                      - generic: c
                      - generic: e
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
  - main [ref=e11]:
    - region "Nucleus" [ref=e12]:
      - heading "Nucleus SJEC — A connection worth making." [level=1] [ref=e13]
      - img "The Nucleus brain logo assembles from a field of luminous particles." [ref=e14]
    - region [ref=e16]:
      - generic [ref=e17]:
        - generic [ref=e18]:
          - paragraph [ref=e19]:
            - generic [ref=e20]: Our Domains
            - generic [aria-hidden] [ref=e21]:
              - generic [ref=e22]:
                - generic [ref=e23]: O
                - generic [ref=e24]: u
                - generic [ref=e25]: r
              - generic [ref=e26]:
                - generic [ref=e27]: D
                - generic [ref=e28]: o
                - generic [ref=e29]: m
                - generic [ref=e30]: a
                - generic [ref=e31]: i
                - generic [ref=e32]: "n"
                - generic [ref=e33]: s
          - heading "Three paths. Infinite directions." [level=2] [ref=e34]:
            - generic [ref=e35]:
              - generic [ref=e36]: THREE PATHS.
              - generic [aria-hidden] [ref=e37]:
                - generic [ref=e38]:
                  - generic [ref=e39]: T
                  - generic [ref=e40]: H
                  - generic [ref=e41]: R
                  - generic [ref=e42]: E
                  - generic [ref=e43]: E
                - generic [ref=e44]:
                  - generic [ref=e45]: P
                  - generic [ref=e46]: A
                  - generic [ref=e47]: T
                  - generic [ref=e48]: H
                  - generic [ref=e49]: S
                  - generic [ref=e50]: .
            - generic [ref=e51]:
              - generic [ref=e52]: INFINITE DIRECTIONS.
              - generic [aria-hidden] [ref=e53]:
                - generic [ref=e54]:
                  - generic [ref=e55]: I
                  - generic [ref=e56]: "N"
                  - generic [ref=e57]: F
                  - generic [ref=e58]: I
                  - generic [ref=e59]: "N"
                  - generic [ref=e60]: I
                  - generic [ref=e61]: T
                  - generic [ref=e62]: E
                - generic [ref=e63]:
                  - generic [ref=e64]: D
                  - generic [ref=e65]: I
                  - generic [ref=e66]: R
                  - generic [ref=e67]: E
                  - generic [ref=e68]: C
                  - generic [ref=e69]: T
                  - generic [ref=e70]: I
                  - generic [ref=e71]: O
                  - generic [ref=e72]: "N"
                  - generic [ref=e73]: S
                  - generic [ref=e74]: .
        - region "Artificial Intelligence detail" [ref=e75]:
          - generic [ref=e76]:
            - generic [ref=e91]:
              - generic [ref=e92]: /01
              - heading "Artificial Intelligence" [level=2] [ref=e93]:
                - generic [aria-hidden] [ref=e95]:
                  - generic [ref=e96]: Artificial
                  - generic [ref=e98]: Intelligence
              - paragraph [ref=e100]:
                - generic [ref=e101]: "& Machine Learning"
                - generic [aria-hidden] [ref=e102]:
                  - generic [ref=e103]: "&"
                  - generic [ref=e105]: Machine
                  - generic [ref=e107]: Learning
            - paragraph [ref=e109]:
              - generic [ref=e110]: Explore machine learning, build models, and turn new questions into experiments.
              - generic [aria-hidden] [ref=e111]:
                - generic [ref=e112]: Explore
                - generic [ref=e114]: machine
                - generic [ref=e116]: learning,
                - generic [ref=e118]: build
                - generic [ref=e120]: models,
                - generic [ref=e122]: and
                - generic [ref=e124]: turn
                - generic [ref=e126]: new
                - generic [ref=e128]: questions
                - generic [ref=e130]: into
                - generic [ref=e132]: experiments.
            - generic [ref=e134]:
              - generic [ref=e135]: Intelligence
              - generic [ref=e136]: Research
              - generic [ref=e137]: Possibility
            - generic [ref=e138]:
              - button "Explore domain" [ref=e139] [cursor=pointer]:
                - generic [ref=e140]:
                  - generic [ref=e141]: Explore domain
                  - generic [aria-hidden] [ref=e142]:
                    - generic [ref=e143]:
                      - generic [ref=e144]: E
                      - generic [ref=e145]: x
                      - generic [ref=e146]: p
                      - generic [ref=e147]: l
                      - generic [ref=e148]: o
                      - generic [ref=e149]: r
                      - generic [ref=e150]: e
                    - generic [ref=e151]:
                      - generic [ref=e152]: d
                      - generic [ref=e153]: o
                      - generic [ref=e154]: m
                      - generic [ref=e155]: a
                      - generic [ref=e156]: i
                      - generic [ref=e157]: "n"
              - link "Join WhatsApp Community" [ref=e161] [cursor=pointer]:
                - /url: https://chat.whatsapp.com/F2sg6LBCwibIKWJu2nhnvI
                - generic [ref=e164]:
                  - generic [ref=e165]: Join WhatsApp Community
                  - generic [aria-hidden] [ref=e166]:
                    - generic [ref=e167]: Join
                    - generic [ref=e169]: WhatsApp
                    - generic [ref=e171]: Community
        - region "Web Development detail" [ref=e173]:
          - generic [ref=e174]:
            - generic [ref=e181]:
              - generic [ref=e182]: /02
              - heading "Web Development" [level=2] [ref=e183]:
                - generic [aria-hidden] [ref=e185]:
                  - generic [ref=e186]: Web
                  - generic [ref=e188]: Development
              - paragraph [ref=e190]:
                - generic [ref=e191]: "& Digital Experiences"
                - generic [aria-hidden] [ref=e192]:
                  - generic [ref=e193]: "&"
                  - generic [ref=e195]: Digital
                  - generic [ref=e197]: Experiences
            - paragraph [ref=e199]:
              - generic [ref=e200]: Design thoughtful interfaces. Build useful applications. Put your ideas on the web.
              - generic [aria-hidden] [ref=e201]:
                - generic [ref=e202]: Design
                - generic [ref=e204]: thoughtful
                - generic [ref=e206]: interfaces.
                - generic [ref=e208]: Build
                - generic [ref=e210]: useful
                - generic [ref=e212]: applications.
                - generic [ref=e214]: Put
                - generic [ref=e216]: your
                - generic [ref=e218]: ideas
                - generic [ref=e220]: "on"
                - generic [ref=e222]: the
                - generic [ref=e224]: web.
            - generic [ref=e226]:
              - generic [ref=e227]: Design
              - generic [ref=e228]: Build
              - generic [ref=e229]: Ship
            - generic [ref=e230]:
              - button "Explore domain" [ref=e231] [cursor=pointer]:
                - generic [ref=e232]:
                  - generic [ref=e233]: Explore domain
                  - generic [aria-hidden] [ref=e234]:
                    - generic [ref=e235]:
                      - generic [ref=e236]: E
                      - generic [ref=e237]: x
                      - generic [ref=e238]: p
                      - generic [ref=e239]: l
                      - generic [ref=e240]: o
                      - generic [ref=e241]: r
                      - generic [ref=e242]: e
                    - generic [ref=e243]:
                      - generic [ref=e244]: d
                      - generic [ref=e245]: o
                      - generic [ref=e246]: m
                      - generic [ref=e247]: a
                      - generic [ref=e248]: i
                      - generic [ref=e249]: "n"
              - link "Join WhatsApp Community" [ref=e253] [cursor=pointer]:
                - /url: https://chat.whatsapp.com/L97jBsJl7vJ6ol1k68Ue9L
                - generic [ref=e256]:
                  - generic [ref=e257]: Join WhatsApp Community
                  - generic [aria-hidden] [ref=e258]:
                    - generic [ref=e259]: Join
                    - generic [ref=e261]: WhatsApp
                    - generic [ref=e263]: Community
        - region "Data Structures detail" [ref=e265]:
          - generic [ref=e266]:
            - generic [ref=e274]:
              - generic [ref=e275]: /03
              - heading "Data Structures" [level=2] [ref=e276]:
                - generic [aria-hidden] [ref=e278]:
                  - generic [ref=e279]: Data
                  - generic [ref=e281]: Structures
              - paragraph [ref=e283]:
                - generic [ref=e284]: "& Algorithms"
                - generic [aria-hidden] [ref=e285]:
                  - generic [ref=e286]: "&"
                  - generic [ref=e288]: Algorithms
            - paragraph [ref=e290]:
              - generic [ref=e291]: Find the patterns, solve hard problems, and build a stronger foundation.
              - generic [aria-hidden] [ref=e292]:
                - generic [ref=e293]: Find
                - generic [ref=e295]: the
                - generic [ref=e297]: patterns,
                - generic [ref=e299]: solve
                - generic [ref=e301]: hard
                - generic [ref=e303]: problems,
                - generic [ref=e305]: and
                - generic [ref=e307]: build
                - generic [ref=e309]: a
                - generic [ref=e311]: stronger
                - generic [ref=e313]: foundation.
            - generic [ref=e315]:
              - generic [ref=e316]: Logic
              - generic [ref=e317]: Patterns
              - generic [ref=e318]: Problem-solving
            - generic [ref=e319]:
              - button "Explore domain" [ref=e320] [cursor=pointer]:
                - generic [ref=e321]:
                  - generic [ref=e322]: Explore domain
                  - generic [aria-hidden] [ref=e323]:
                    - generic [ref=e324]:
                      - generic [ref=e325]: E
                      - generic [ref=e326]: x
                      - generic [ref=e327]: p
                      - generic [ref=e328]: l
                      - generic [ref=e329]: o
                      - generic [ref=e330]: r
                      - generic [ref=e331]: e
                    - generic [ref=e332]:
                      - generic [ref=e333]: d
                      - generic [ref=e334]: o
                      - generic [ref=e335]: m
                      - generic [ref=e336]: a
                      - generic [ref=e337]: i
                      - generic [ref=e338]: "n"
              - link "Join WhatsApp Community" [ref=e342] [cursor=pointer]:
                - /url: https://chat.whatsapp.com/LPTqGQdnGRo24BEZyrk9vy
                - generic [ref=e345]:
                  - generic [ref=e346]: Join WhatsApp Community
                  - generic [aria-hidden] [ref=e347]:
                    - generic [ref=e348]: Join
                    - generic [ref=e350]: WhatsApp
                    - generic [ref=e352]: Community
    - generic [ref=e354]:
      - generic [ref=e355]:
        - generic [ref=e356]: JOIN THE COMMUNITY
        - generic [aria-hidden] [ref=e357]:
          - generic [ref=e358]:
            - generic [ref=e359]: J
            - generic [ref=e360]: O
            - generic [ref=e361]: I
            - generic [ref=e362]: "N"
          - generic [ref=e363]:
            - generic [ref=e364]: T
            - generic [ref=e365]: H
            - generic [ref=e366]: E
          - generic [ref=e367]:
            - generic [ref=e368]: C
            - generic [ref=e369]: O
            - generic [ref=e370]: M
            - generic [ref=e371]: M
            - generic [ref=e372]: U
            - generic [ref=e373]: "N"
            - generic [ref=e374]: I
            - generic [ref=e375]: T
            - generic [ref=e376]: "Y"
      - heading "Learn. Build. Collaborate." [level=2] [ref=e377]:
        - generic [ref=e378]:
          - generic [ref=e379]: LEARN. BUILD.
          - generic [aria-hidden] [ref=e380]:
            - generic [ref=e381]:
              - generic [ref=e382]: L
              - generic [ref=e383]: E
              - generic [ref=e384]: A
              - generic [ref=e385]: R
              - generic [ref=e386]: "N"
              - generic [ref=e387]: .
            - generic [ref=e388]:
              - generic [ref=e389]: B
              - generic [ref=e390]: U
              - generic [ref=e391]: I
              - generic [ref=e392]: L
              - generic [ref=e393]: D
              - generic [ref=e394]: .
        - generic [ref=e395]:
          - generic [ref=e396]: COLLABORATE.
          - generic [ref=e398]:
            - generic [ref=e399]: C
            - generic [ref=e400]: O
            - generic [ref=e401]: L
            - generic [ref=e402]: L
            - generic [ref=e403]: A
            - generic [ref=e404]: B
            - generic [ref=e405]: O
            - generic [ref=e406]: R
            - generic [ref=e407]: A
            - generic [ref=e408]: T
            - generic [ref=e409]: E
            - generic [ref=e410]: .
      - paragraph [ref=e411]:
        - generic [ref=e412]: Applications are currently closed. Check out our latest projects and events to see what we're building.
        - generic [aria-hidden] [ref=e413]:
          - generic [ref=e414]: Applications
          - generic [ref=e416]: are
          - generic [ref=e418]: currently
          - generic [ref=e420]: closed.
          - generic [ref=e422]: Check
          - generic [ref=e424]: out
          - generic [ref=e426]: our
          - generic [ref=e428]: latest
          - generic [ref=e430]: projects
          - generic [ref=e432]: and
          - generic [ref=e434]: events
          - generic [ref=e436]: to
          - generic [ref=e438]: see
          - generic [ref=e440]: what
          - generic [ref=e442]: we're
          - generic [ref=e444]: building.
      - generic [ref=e446]:
        - link "JOIN CLUB" [ref=e447] [cursor=pointer]:
          - /url: /recruitment
          - generic [ref=e448]:
            - generic [ref=e449]: JOIN CLUB
            - generic [aria-hidden] [ref=e450]:
              - generic [ref=e451]:
                - generic [ref=e452]: J
                - generic [ref=e453]: O
                - generic [ref=e454]: I
                - generic [ref=e455]: "N"
              - generic [ref=e456]:
                - generic [ref=e457]: C
                - generic [ref=e458]: L
                - generic [ref=e459]: U
                - generic [ref=e460]: B
        - link "PROJECTS" [ref=e464] [cursor=pointer]:
          - /url: /projects
          - generic [ref=e465]:
            - generic [ref=e466]: PROJECTS
            - generic [ref=e468]:
              - generic [ref=e469]: P
              - generic [ref=e470]: R
              - generic [ref=e471]: O
              - generic [ref=e472]: J
              - generic [ref=e473]: E
              - generic [ref=e474]: C
              - generic [ref=e475]: T
              - generic [ref=e476]: S
    - region "Community voices" [ref=e477]:
      - generic [ref=e478]:
        - heading "THE VOICES OF NUCLEUS" [level=2] [ref=e479]:
          - generic [aria-hidden] [ref=e481]:
            - generic [ref=e482]:
              - generic [ref=e483]: T
              - generic [ref=e484]: H
              - generic [ref=e485]: E
            - generic [ref=e486]:
              - generic [ref=e487]: V
              - generic [ref=e488]: O
              - generic [ref=e489]: I
              - generic [ref=e490]: C
              - generic [ref=e491]: E
              - generic [ref=e492]: S
            - generic [ref=e493]:
              - generic [ref=e494]: O
              - generic [ref=e495]: F
            - generic [ref=e496]:
              - generic [ref=e497]: "N"
              - generic [ref=e498]: U
              - generic [ref=e499]: C
              - generic [ref=e500]: L
              - generic [ref=e501]: E
              - generic [ref=e502]: U
              - generic [ref=e503]: S
        - button "Pause moving voices" [ref=e504] [cursor=pointer]
      - region "Community voices, first row" [ref=e505]:
        - generic [ref=e506]:
          - generic [ref=e507]:
            - generic [ref=e508]:
              - generic [aria-hidden] [ref=e509]: K
              - generic [ref=e510]:
                - paragraph [ref=e511]: Ken Masters
                - paragraph [ref=e512]: "@kmasters"
            - paragraph [ref=e513]: “Our productivity has nearly doubled since onboarding. Automation features removed repetitive tasks, allowing our team to focus on building instead of managing operations.”
          - generic [ref=e514]:
            - generic [ref=e515]:
              - generic [aria-hidden] [ref=e516]: K
              - generic [ref=e517]:
                - paragraph [ref=e518]: Kira Athrun
                - paragraph [ref=e519]: "@kathrun"
            - paragraph [ref=e520]: “What surprised us most was how quickly our team adapted. Minimal learning curve, excellent documentation, and powerful features make it a must-have for modern SaaS companies.”
          - generic [ref=e521]:
            - generic [ref=e522]:
              - generic [aria-hidden] [ref=e523]: L
              - generic [ref=e524]:
                - paragraph [ref=e525]: Lirael Nassun
                - paragraph [ref=e526]: "@lnassun"
            - paragraph [ref=e527]: “This is easily one of the most reliable SaaS tools we’ve adopted. The UI is intuitive, integrations are seamless, and it saves us countless hours every week.”
          - generic [ref=e528]:
            - generic [ref=e529]:
              - generic [aria-hidden] [ref=e530]: J
              - generic [ref=e531]:
                - paragraph [ref=e532]: Jessica
                - paragraph [ref=e533]: "@jessica"
            - paragraph [ref=e534]: “Switching to this platform streamlined our entire workflow. Setup was effortless, performance improved instantly, and our team now ships features faster without worrying about infrastructure.”
          - generic [ref=e535]:
            - generic [ref=e536]:
              - generic [aria-hidden] [ref=e537]: J
              - generic [ref=e538]:
                - paragraph [ref=e539]: Jenny
                - paragraph [ref=e540]: "@jenny"
            - paragraph [ref=e541]: “We evaluated multiple solutions, but this stood out immediately. It’s fast, scalable, and thoughtfully designed for growing teams that need stability without added complexity.”
        - generic [aria-hidden] [ref=e542]:
          - generic [ref=e543]:
            - generic [ref=e544]:
              - generic [aria-hidden] [ref=e545]: K
              - generic [ref=e546]:
                - paragraph [ref=e547]: Ken Masters
                - paragraph [ref=e548]: "@kmasters"
            - paragraph [ref=e549]: “Our productivity has nearly doubled since onboarding. Automation features removed repetitive tasks, allowing our team to focus on building instead of managing operations.”
          - generic [ref=e550]:
            - generic [ref=e551]:
              - generic [aria-hidden] [ref=e552]: K
              - generic [ref=e553]:
                - paragraph [ref=e554]: Kira Athrun
                - paragraph [ref=e555]: "@kathrun"
            - paragraph [ref=e556]: “What surprised us most was how quickly our team adapted. Minimal learning curve, excellent documentation, and powerful features make it a must-have for modern SaaS companies.”
          - generic [ref=e557]:
            - generic [ref=e558]:
              - generic [aria-hidden] [ref=e559]: L
              - generic [ref=e560]:
                - paragraph [ref=e561]: Lirael Nassun
                - paragraph [ref=e562]: "@lnassun"
            - paragraph [ref=e563]: “This is easily one of the most reliable SaaS tools we’ve adopted. The UI is intuitive, integrations are seamless, and it saves us countless hours every week.”
          - generic [ref=e564]:
            - generic [ref=e565]:
              - generic [aria-hidden] [ref=e566]: J
              - generic [ref=e567]:
                - paragraph [ref=e568]: Jessica
                - paragraph [ref=e569]: "@jessica"
            - paragraph [ref=e570]: “Switching to this platform streamlined our entire workflow. Setup was effortless, performance improved instantly, and our team now ships features faster without worrying about infrastructure.”
          - generic [ref=e571]:
            - generic [ref=e572]:
              - generic [aria-hidden] [ref=e573]: J
              - generic [ref=e574]:
                - paragraph [ref=e575]: Jenny
                - paragraph [ref=e576]: "@jenny"
            - paragraph [ref=e577]: “We evaluated multiple solutions, but this stood out immediately. It’s fast, scalable, and thoughtfully designed for growing teams that need stability without added complexity.”
      - region "Community voices, second row" [ref=e578]:
        - generic [ref=e579]:
          - generic [ref=e580]:
            - generic [ref=e581]:
              - generic [aria-hidden] [ref=e582]: J
              - generic [ref=e583]:
                - paragraph [ref=e584]: Jenny
                - paragraph [ref=e585]: "@jenny"
            - paragraph [ref=e586]: “We evaluated multiple solutions, but this stood out immediately. It’s fast, scalable, and thoughtfully designed for growing teams that need stability without added complexity.”
          - generic [ref=e587]:
            - generic [ref=e588]:
              - generic [aria-hidden] [ref=e589]: J
              - generic [ref=e590]:
                - paragraph [ref=e591]: Jessica
                - paragraph [ref=e592]: "@jessica"
            - paragraph [ref=e593]: “Switching to this platform streamlined our entire workflow. Setup was effortless, performance improved instantly, and our team now ships features faster without worrying about infrastructure.”
          - generic [ref=e594]:
            - generic [ref=e595]:
              - generic [aria-hidden] [ref=e596]: L
              - generic [ref=e597]:
                - paragraph [ref=e598]: Lirael Nassun
                - paragraph [ref=e599]: "@lnassun"
            - paragraph [ref=e600]: “This is easily one of the most reliable SaaS tools we’ve adopted. The UI is intuitive, integrations are seamless, and it saves us countless hours every week.”
          - generic [ref=e601]:
            - generic [ref=e602]:
              - generic [aria-hidden] [ref=e603]: K
              - generic [ref=e604]:
                - paragraph [ref=e605]: Kira Athrun
                - paragraph [ref=e606]: "@kathrun"
            - paragraph [ref=e607]: “What surprised us most was how quickly our team adapted. Minimal learning curve, excellent documentation, and powerful features make it a must-have for modern SaaS companies.”
          - generic [ref=e608]:
            - generic [ref=e609]:
              - generic [aria-hidden] [ref=e610]: K
              - generic [ref=e611]:
                - paragraph [ref=e612]: Ken Masters
                - paragraph [ref=e613]: "@kmasters"
            - paragraph [ref=e614]: “Our productivity has nearly doubled since onboarding. Automation features removed repetitive tasks, allowing our team to focus on building instead of managing operations.”
        - generic [aria-hidden] [ref=e615]:
          - generic [ref=e616]:
            - generic [ref=e617]:
              - generic [aria-hidden] [ref=e618]: J
              - generic [ref=e619]:
                - paragraph [ref=e620]: Jenny
                - paragraph [ref=e621]: "@jenny"
            - paragraph [ref=e622]: “We evaluated multiple solutions, but this stood out immediately. It’s fast, scalable, and thoughtfully designed for growing teams that need stability without added complexity.”
          - generic [ref=e623]:
            - generic [ref=e624]:
              - generic [aria-hidden] [ref=e625]: J
              - generic [ref=e626]:
                - paragraph [ref=e627]: Jessica
                - paragraph [ref=e628]: "@jessica"
            - paragraph [ref=e629]: “Switching to this platform streamlined our entire workflow. Setup was effortless, performance improved instantly, and our team now ships features faster without worrying about infrastructure.”
          - generic [ref=e630]:
            - generic [ref=e631]:
              - generic [aria-hidden] [ref=e632]: L
              - generic [ref=e633]:
                - paragraph [ref=e634]: Lirael Nassun
                - paragraph [ref=e635]: "@lnassun"
            - paragraph [ref=e636]: “This is easily one of the most reliable SaaS tools we’ve adopted. The UI is intuitive, integrations are seamless, and it saves us countless hours every week.”
          - generic [ref=e637]:
            - generic [ref=e638]:
              - generic [aria-hidden] [ref=e639]: K
              - generic [ref=e640]:
                - paragraph [ref=e641]: Kira Athrun
                - paragraph [ref=e642]: "@kathrun"
            - paragraph [ref=e643]: “What surprised us most was how quickly our team adapted. Minimal learning curve, excellent documentation, and powerful features make it a must-have for modern SaaS companies.”
          - generic [ref=e644]:
            - generic [ref=e645]:
              - generic [aria-hidden] [ref=e646]: K
              - generic [ref=e647]:
                - paragraph [ref=e648]: Ken Masters
                - paragraph [ref=e649]: "@kmasters"
            - paragraph [ref=e650]: “Our productivity has nearly doubled since onboarding. Automation features removed repetitive tasks, allowing our team to focus on building instead of managing operations.”
  - contentinfo [ref=e651]:
    - generic [ref=e652]:
      - link "Nucleus home" [ref=e653] [cursor=pointer]:
        - /url: /
        - generic [ref=e656]:
          - text: NUCLEUS
          - generic [ref=e657]: SJEC · MANGALURU
      - generic [ref=e658]:
        - link "Nucleus Instagram" [ref=e659] [cursor=pointer]:
          - /url: https://www.instagram.com/nucleus_sjec/
        - link "Nucleus LinkedIn" [ref=e663] [cursor=pointer]:
          - /url: https://www.linkedin.com/company/nucleus-sjec/
        - link "Nucleus GitHub" [ref=e668] [cursor=pointer]:
          - /url: https://github.com/nucleus-sjec
        - link "Email Nucleus" [ref=e672] [cursor=pointer]:
          - /url: mailto:nucleussjec@gmail.com
    - generic [ref=e676]:
      - generic [ref=e677]: © 2026 Nucleus SJEC
      - generic [ref=e678]: Made of many minds.
      - link "Admin" [ref=e679] [cursor=pointer]:
        - /url: /admin
```

# Test source

```ts
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
  166 | test('navigation mounts the tower behind the bands before the delayed exit', async ({ page }) => {
  167 |   await page.goto('/recruitment');
  168 |   await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done', { timeout: 15000 });
  169 |   await toggle(page).click();
  170 |   await settledOpen(page);
  171 |   await expect(page.locator('.morph-nav__footer > div').last()).toHaveCSS('opacity', '1');
  172 |   await page.clock.install({ time: new Date('2026-10-02T12:00:00Z') });
  173 |   await page.clock.pauseAt(new Date('2026-10-02T12:00:01Z'));
  174 | 
  175 |   await menu(page).getByRole('link', { name: 'The people', exact: true }).dispatchEvent('click');
  176 |   await expect(page).toHaveURL(/\/team$/);
  177 |   await expect(page.locator('.people-page')).toHaveAttribute('data-tower-status', 'ready');
  178 |   await expect(page.locator('.people-tower__world canvas')).toHaveCount(1);
  179 |   await page.clock.runFor(399);
  180 |   await expect(toggle(page)).toHaveAttribute('aria-expanded', 'true');
  181 |   await expect(page.locator('main')).toHaveAttribute('inert');
  182 |   await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
  183 |   for (const band of await page.locator('.morph-nav__band').all()) await expect(band).toHaveCSS('transform', 'none');
  184 | 
  185 |   await page.clock.runFor(1);
  186 |   await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false');
  187 |   await expect(toggle(page)).toBeFocused();
  188 |   await expect(page.locator('main')).not.toHaveAttribute('inert');
  189 |   await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  190 |   await page.clock.runFor(1400);
  191 |   const overlay = await page.locator('.morph-nav__overlay').boundingBox();
  192 |   expect(Math.round(overlay.x)).toBe(page.viewportSize().width);
  193 | });
  194 | 
  195 | test('repeated navigation restarts the delay and reopening cancels a stale close', async ({ page }) => {
  196 |   await page.emulateMedia({ reducedMotion: 'reduce' });
  197 |   await page.goto('/recruitment');
  198 |   await toggle(page).click();
  199 |   await settledOpen(page);
  200 |   await page.clock.install({ time: new Date('2026-10-02T12:00:00Z') });
  201 |   await page.clock.pauseAt(new Date('2026-10-02T12:00:01Z'));
  202 | 
  203 |   await menu(page).getByRole('link', { name: 'Our work', exact: true }).dispatchEvent('click');
  204 |   await expect(page).toHaveURL(/\/projects$/);
  205 |   await page.clock.runFor(200);
  206 |   await menu(page).getByRole('link', { name: 'The people', exact: true }).dispatchEvent('click');
  207 |   await expect(page).toHaveURL(/\/team$/);
  208 |   await page.clock.runFor(399);
  209 |   await expect(toggle(page)).toHaveAttribute('aria-expanded', 'true');
  210 |   await page.clock.runFor(1);
  211 |   await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false');
  212 | 
  213 |   await toggle(page).dispatchEvent('click');
  214 |   await page.locator('.morph-nav__brand').dispatchEvent('click');
  215 |   await expect(page).toHaveURL(url => url.pathname === '/');
  216 |   await page.clock.runFor(200);
  217 |   await toggle(page).dispatchEvent('click');
  218 |   await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false');
  219 |   await toggle(page).dispatchEvent('click');
  220 |   await page.clock.runFor(400);
  221 |   await expect(toggle(page)).toHaveAttribute('aria-expanded', 'true');
  222 |   await expect(page.locator('main')).toHaveAttribute('inert');
  223 | });
  224 | 
  225 | test('mobile and landscape menus fit long labels and keep every action reachable', async ({ browser }) => {
  226 |   const context = await browser.newContext({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  227 |   const page = await context.newPage();
  228 |   await page.route('**/api/site', route => route.fulfill({ json: site }));
  229 |   await page.goto('/events');
  230 |   for (const viewport of [{ width: 390, height: 844 }, { width: 280, height: 653 }, { width: 844, height: 390 }]) {
  231 |     await page.setViewportSize(viewport);
  232 |     await toggle(page).tap();
  233 |     await settledOpen(page);
  234 |     const pill = await page.locator('.morph-nav__pill').boundingBox();
  235 |     expect(Math.abs(pill.x + pill.width / 2 - viewport.width / 2)).toBeLessThan(1);
  236 |     for (const title of await page.locator('.morph-nav__title').all()) {
  237 |       const box = await title.boundingBox();
  238 |       expect(box.x).toBeGreaterThanOrEqual(0);
  239 |       expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
  240 |       await expect(title).toBeInViewport();
  241 |     }
  242 |     await expect(page.locator('.morph-nav__join')).toBeInViewport();
  243 |     expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(viewport.width);
  244 |     await page.screenshot({ path: 'output/navbar-match/mobile-' + viewport.width + '-open.png' });
  245 |     await toggle(page).tap();
  246 |     await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false');
  247 |   }
  248 |   await context.close();
  249 | });
  250 | 
  251 | test('opening from a scrolled page locks the background and rapid toggles recover cleanly', async ({ page }) => {
  252 |   await page.goto('/');
  253 |   await expect(page.locator('html')).toHaveClass(/lenis/);
  254 |   await page.mouse.move(20, 450);
  255 |   await page.mouse.wheel(0, 600);
> 256 |   await expect.poll(() => page.evaluate(() => scrollY)).toBe(360);
      |                                                         ^ Error: expect(received).toBe(expected) // Object.is equality
  257 |   await toggle(page).click();
  258 |   await settledOpen(page);
  259 |   await expect(page.locator('html')).not.toHaveClass(/lenis/);
  260 |   const position = await page.evaluate(() => scrollY);
  261 |   await page.mouse.move(600, 450);
  262 |   await page.mouse.wheel(0, 1200);
  263 |   await page.waitForTimeout(200);
  264 |   expect(await page.evaluate(() => scrollY)).toBe(position);
  265 |   await page.keyboard.press('Escape');
  266 |   await expect(page.locator('html')).toHaveClass(/lenis/);
  267 |   expect(await page.evaluate(() => scrollY)).toBe(position);
  268 |   for (let index = 0; index < 6; index++) {
  269 |     await toggle(page).dispatchEvent('click');
  270 |     await page.waitForTimeout(50);
  271 |   }
  272 |   await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false');
  273 |   await expect(page.locator('.morph-nav__overlay')).toHaveAttribute('inert');
  274 |   await expect(page.locator('main')).not.toHaveAttribute('inert');
  275 |   await toggle(page).click();
  276 |   await settledOpen(page);
  277 |   await expect(menu(page).getByRole('link', { name: 'Our work', exact: true })).toBeVisible();
  278 |   await page.keyboard.press('Escape');
  279 | });
  280 | 
```