# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: morphing-navbar.spec.mjs >> reopening replays the stagger after completed and interrupted closes
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
- generic [ref=e3]:
  - link "Skip to content" [ref=e4] [cursor=pointer]:
    - /url: "#main-content"
  - banner:
    - navigation "Main navigation":
      - dialog "Navigation menu":
        - generic [ref=e5]:
          - link "Nucleus home" [ref=e6] [cursor=pointer]:
            - /url: /
            - text: Nucleus
          - button "Close menu" [expanded] [ref=e7] [cursor=pointer]
        - generic [ref=e18]:
          - generic [ref=e19]:
            - list [ref=e20]:
              - listitem [ref=e21]:
                - link "Home" [ref=e22] [cursor=pointer]:
                  - /url: /
                  - generic [aria-hidden] [ref=e24]:
                    - generic [ref=e25]: H
                    - generic [ref=e26]: o
                    - generic [ref=e27]: m
                    - generic [ref=e28]: e
              - listitem [ref=e29]:
                - link "Experiences" [ref=e30] [cursor=pointer]:
                  - /url: /events
                  - generic [aria-hidden] [ref=e31]:
                    - generic [ref=e32]: E
                    - generic [ref=e33]: x
                    - generic [ref=e34]: p
                    - generic [ref=e35]: e
                    - generic [ref=e36]: r
                    - generic [ref=e37]: i
                    - generic [ref=e38]: e
                    - generic [ref=e39]: "n"
                    - generic [ref=e40]: c
                    - generic [ref=e41]: e
                    - generic [ref=e42]: s
              - listitem [ref=e43]:
                - link "Our work" [ref=e44] [cursor=pointer]:
                  - /url: /projects
                  - generic [aria-hidden] [ref=e45]:
                    - generic [ref=e46]: O
                    - generic [ref=e47]: u
                    - generic [ref=e48]: r
                    - generic [ref=e50]: w
                    - generic [ref=e51]: o
                    - generic [ref=e52]: r
                    - generic [ref=e53]: k
              - listitem [ref=e54]:
                - link "The people" [ref=e55] [cursor=pointer]:
                  - /url: /team
                  - generic [aria-hidden] [ref=e56]:
                    - generic [ref=e57]: T
                    - generic [ref=e58]: h
                    - generic [ref=e59]: e
                    - generic [ref=e61]: p
                    - generic [ref=e62]: e
                    - generic [ref=e63]: o
                    - generic [ref=e64]: p
                    - generic [ref=e65]: l
                    - generic [ref=e66]: e
            - list "Social links" [ref=e67]:
              - listitem [ref=e68]:
                - link "Instagram" [ref=e69] [cursor=pointer]:
                  - /url: https://www.instagram.com/nucleus_sjec/
              - listitem [ref=e73]:
                - link "LinkedIn" [ref=e74] [cursor=pointer]:
                  - /url: https://www.linkedin.com/company/nucleus-sjec/
              - listitem [ref=e78]:
                - link "GitHub" [ref=e79] [cursor=pointer]:
                  - /url: https://github.com/nucleus-sjec
              - listitem [ref=e83]:
                - link "Email" [ref=e84] [cursor=pointer]:
                  - /url: mailto:nucleussjec@gmail.com
          - generic [ref=e88]:
            - generic [ref=e89]:
              - generic [ref=e90]: Made of many minds
              - generic [ref=e91]: © 2026 Nucleus SJEC
            - generic [ref=e92]:
              - generic [ref=e93]: The community
              - button "Stay connected" [ref=e94] [cursor=pointer]
  - main [ref=e98]:
    - region "Nucleus" [ref=e99]:
      - heading "Nucleus SJEC — A connection worth making." [level=1] [ref=e100]
      - img "The Nucleus brain logo assembles from a field of luminous particles." [ref=e101]
      - generic:
        - group "THE NUCLEUS CLUB. CREATE. EXPLORE. INNOVATE":
          - generic [aria-hidden]:
            - generic: EXPLORE
            - generic: INNOVATE
    - region [ref=e103]:
      - generic [ref=e104]:
        - generic [ref=e105]:
          - paragraph [ref=e106]:
            - generic [ref=e107]: Our Domains
            - generic [aria-hidden] [ref=e108]:
              - generic [ref=e109]:
                - generic [ref=e110]: O
                - generic [ref=e111]: u
                - generic [ref=e112]: r
              - generic [ref=e113]:
                - generic [ref=e114]: D
                - generic [ref=e115]: o
                - generic [ref=e116]: m
                - generic [ref=e117]: a
                - generic [ref=e118]: i
                - generic [ref=e119]: "n"
                - generic [ref=e120]: s
          - heading "Three paths. Infinite directions." [level=2] [ref=e121]:
            - generic [ref=e122]:
              - generic [ref=e123]: THREE PATHS.
              - generic [aria-hidden] [ref=e124]:
                - generic [ref=e125]:
                  - generic [ref=e126]: T
                  - generic [ref=e127]: H
                  - generic [ref=e128]: R
                  - generic [ref=e129]: E
                  - generic [ref=e130]: E
                - generic [ref=e131]:
                  - generic [ref=e132]: P
                  - generic [ref=e133]: A
                  - generic [ref=e134]: T
                  - generic [ref=e135]: H
                  - generic [ref=e136]: S
                  - generic [ref=e137]: .
            - generic [ref=e138]:
              - generic [ref=e139]: INFINITE DIRECTIONS.
              - generic [aria-hidden] [ref=e140]:
                - generic [ref=e141]:
                  - generic [ref=e142]: I
                  - generic [ref=e143]: "N"
                  - generic [ref=e144]: F
                  - generic [ref=e145]: I
                  - generic [ref=e146]: "N"
                  - generic [ref=e147]: I
                  - generic [ref=e148]: T
                  - generic [ref=e149]: E
                - generic [ref=e150]:
                  - generic [ref=e151]: D
                  - generic [ref=e152]: I
                  - generic [ref=e153]: R
                  - generic [ref=e154]: E
                  - generic [ref=e155]: C
                  - generic [ref=e156]: T
                  - generic [ref=e157]: I
                  - generic [ref=e158]: O
                  - generic [ref=e159]: "N"
                  - generic [ref=e160]: S
                  - generic [ref=e161]: .
        - region "Artificial Intelligence detail" [ref=e162]:
          - generic [ref=e163]:
            - generic [ref=e178]:
              - generic [ref=e179]: /01
              - heading "Artificial Intelligence" [level=2] [ref=e180]:
                - generic [aria-hidden] [ref=e182]:
                  - generic [ref=e183]: Artificial
                  - generic [ref=e185]: Intelligence
              - paragraph [ref=e187]:
                - generic [ref=e188]: "& Machine Learning"
                - generic [aria-hidden] [ref=e189]:
                  - generic [ref=e190]: "&"
                  - generic [ref=e192]: Machine
                  - generic [ref=e194]: Learning
            - paragraph [ref=e196]:
              - generic [ref=e197]: Explore machine learning, build models, and turn new questions into experiments.
              - generic [aria-hidden] [ref=e198]:
                - generic [ref=e199]: Explore
                - generic [ref=e201]: machine
                - generic [ref=e203]: learning,
                - generic [ref=e205]: build
                - generic [ref=e207]: models,
                - generic [ref=e209]: and
                - generic [ref=e211]: turn
                - generic [ref=e213]: new
                - generic [ref=e215]: questions
                - generic [ref=e217]: into
                - generic [ref=e219]: experiments.
            - generic [ref=e221]:
              - generic [ref=e222]: Intelligence
              - generic [ref=e223]: Research
              - generic [ref=e224]: Possibility
            - generic [ref=e225]:
              - button "Explore domain" [ref=e226] [cursor=pointer]:
                - generic [ref=e227]:
                  - generic [ref=e228]: Explore domain
                  - generic [aria-hidden] [ref=e229]:
                    - generic [ref=e230]:
                      - generic [ref=e231]: E
                      - generic [ref=e232]: x
                      - generic [ref=e233]: p
                      - generic [ref=e234]: l
                      - generic [ref=e235]: o
                      - generic [ref=e236]: r
                      - generic [ref=e237]: e
                    - generic [ref=e238]:
                      - generic [ref=e239]: d
                      - generic [ref=e240]: o
                      - generic [ref=e241]: m
                      - generic [ref=e242]: a
                      - generic [ref=e243]: i
                      - generic [ref=e244]: "n"
              - link "Join WhatsApp Community" [ref=e248] [cursor=pointer]:
                - /url: https://chat.whatsapp.com/F2sg6LBCwibIKWJu2nhnvI
                - generic [ref=e251]:
                  - generic [ref=e252]: Join WhatsApp Community
                  - generic [aria-hidden] [ref=e253]:
                    - generic [ref=e254]: Join
                    - generic [ref=e256]: WhatsApp
                    - generic [ref=e258]: Community
        - region "Web Development detail" [ref=e260]:
          - generic [ref=e261]:
            - generic [ref=e268]:
              - generic [ref=e269]: /02
              - heading "Web Development" [level=2] [ref=e270]:
                - generic [aria-hidden] [ref=e272]:
                  - generic [ref=e273]: Web
                  - generic [ref=e275]: Development
              - paragraph [ref=e277]:
                - generic [ref=e278]: "& Digital Experiences"
                - generic [aria-hidden] [ref=e279]:
                  - generic [ref=e280]: "&"
                  - generic [ref=e282]: Digital
                  - generic [ref=e284]: Experiences
            - paragraph [ref=e286]:
              - generic [ref=e287]: Design thoughtful interfaces. Build useful applications. Put your ideas on the web.
              - generic [aria-hidden] [ref=e288]:
                - generic [ref=e289]: Design
                - generic [ref=e291]: thoughtful
                - generic [ref=e293]: interfaces.
                - generic [ref=e295]: Build
                - generic [ref=e297]: useful
                - generic [ref=e299]: applications.
                - generic [ref=e301]: Put
                - generic [ref=e303]: your
                - generic [ref=e305]: ideas
                - generic [ref=e307]: "on"
                - generic [ref=e309]: the
                - generic [ref=e311]: web.
            - generic [ref=e313]:
              - generic [ref=e314]: Design
              - generic [ref=e315]: Build
              - generic [ref=e316]: Ship
            - generic [ref=e317]:
              - button "Explore domain" [ref=e318] [cursor=pointer]:
                - generic [ref=e319]:
                  - generic [ref=e320]: Explore domain
                  - generic [aria-hidden] [ref=e321]:
                    - generic [ref=e322]:
                      - generic [ref=e323]: E
                      - generic [ref=e324]: x
                      - generic [ref=e325]: p
                      - generic [ref=e326]: l
                      - generic [ref=e327]: o
                      - generic [ref=e328]: r
                      - generic [ref=e329]: e
                    - generic [ref=e330]:
                      - generic [ref=e331]: d
                      - generic [ref=e332]: o
                      - generic [ref=e333]: m
                      - generic [ref=e334]: a
                      - generic [ref=e335]: i
                      - generic [ref=e336]: "n"
              - link "Join WhatsApp Community" [ref=e340] [cursor=pointer]:
                - /url: https://chat.whatsapp.com/L97jBsJl7vJ6ol1k68Ue9L
                - generic [ref=e343]:
                  - generic [ref=e344]: Join WhatsApp Community
                  - generic [aria-hidden] [ref=e345]:
                    - generic [ref=e346]: Join
                    - generic [ref=e348]: WhatsApp
                    - generic [ref=e350]: Community
        - region "Data Structures detail" [ref=e352]:
          - generic [ref=e353]:
            - generic [ref=e361]:
              - generic [ref=e362]: /03
              - heading "Data Structures" [level=2] [ref=e363]:
                - generic [aria-hidden] [ref=e365]:
                  - generic [ref=e366]: Data
                  - generic [ref=e368]: Structures
              - paragraph [ref=e370]:
                - generic [ref=e371]: "& Algorithms"
                - generic [aria-hidden] [ref=e372]:
                  - generic [ref=e373]: "&"
                  - generic [ref=e375]: Algorithms
            - paragraph [ref=e377]:
              - generic [ref=e378]: Find the patterns, solve hard problems, and build a stronger foundation.
              - generic [aria-hidden] [ref=e379]:
                - generic [ref=e380]: Find
                - generic [ref=e382]: the
                - generic [ref=e384]: patterns,
                - generic [ref=e386]: solve
                - generic [ref=e388]: hard
                - generic [ref=e390]: problems,
                - generic [ref=e392]: and
                - generic [ref=e394]: build
                - generic [ref=e396]: a
                - generic [ref=e398]: stronger
                - generic [ref=e400]: foundation.
            - generic [ref=e402]:
              - generic [ref=e403]: Logic
              - generic [ref=e404]: Patterns
              - generic [ref=e405]: Problem-solving
            - generic [ref=e406]:
              - button "Explore domain" [ref=e407] [cursor=pointer]:
                - generic [ref=e408]:
                  - generic [ref=e409]: Explore domain
                  - generic [aria-hidden] [ref=e410]:
                    - generic [ref=e411]:
                      - generic [ref=e412]: E
                      - generic [ref=e413]: x
                      - generic [ref=e414]: p
                      - generic [ref=e415]: l
                      - generic [ref=e416]: o
                      - generic [ref=e417]: r
                      - generic [ref=e418]: e
                    - generic [ref=e419]:
                      - generic [ref=e420]: d
                      - generic [ref=e421]: o
                      - generic [ref=e422]: m
                      - generic [ref=e423]: a
                      - generic [ref=e424]: i
                      - generic [ref=e425]: "n"
              - link "Join WhatsApp Community" [ref=e429] [cursor=pointer]:
                - /url: https://chat.whatsapp.com/LPTqGQdnGRo24BEZyrk9vy
                - generic [ref=e432]:
                  - generic [ref=e433]: Join WhatsApp Community
                  - generic [aria-hidden] [ref=e434]:
                    - generic [ref=e435]: Join
                    - generic [ref=e437]: WhatsApp
                    - generic [ref=e439]: Community
    - generic [ref=e441]:
      - generic [ref=e442]:
        - generic [ref=e443]: JOIN THE COMMUNITY
        - generic [aria-hidden] [ref=e444]:
          - generic [ref=e445]:
            - generic [ref=e446]: J
            - generic [ref=e447]: O
            - generic [ref=e448]: I
            - generic [ref=e449]: "N"
          - generic [ref=e450]:
            - generic [ref=e451]: T
            - generic [ref=e452]: H
            - generic [ref=e453]: E
          - generic [ref=e454]:
            - generic [ref=e455]: C
            - generic [ref=e456]: O
            - generic [ref=e457]: M
            - generic [ref=e458]: M
            - generic [ref=e459]: U
            - generic [ref=e460]: "N"
            - generic [ref=e461]: I
            - generic [ref=e462]: T
            - generic [ref=e463]: "Y"
      - heading "Learn. Build. Collaborate." [level=2] [ref=e464]:
        - generic [ref=e465]:
          - generic [ref=e466]: LEARN. BUILD.
          - generic [aria-hidden] [ref=e467]:
            - generic [ref=e468]:
              - generic [ref=e469]: L
              - generic [ref=e470]: E
              - generic [ref=e471]: A
              - generic [ref=e472]: R
              - generic [ref=e473]: "N"
              - generic [ref=e474]: .
            - generic [ref=e475]:
              - generic [ref=e476]: B
              - generic [ref=e477]: U
              - generic [ref=e478]: I
              - generic [ref=e479]: L
              - generic [ref=e480]: D
              - generic [ref=e481]: .
        - generic [ref=e482]:
          - generic [ref=e483]: COLLABORATE.
          - generic [ref=e485]:
            - generic [ref=e486]: C
            - generic [ref=e487]: O
            - generic [ref=e488]: L
            - generic [ref=e489]: L
            - generic [ref=e490]: A
            - generic [ref=e491]: B
            - generic [ref=e492]: O
            - generic [ref=e493]: R
            - generic [ref=e494]: A
            - generic [ref=e495]: T
            - generic [ref=e496]: E
            - generic [ref=e497]: .
      - paragraph [ref=e498]:
        - generic [ref=e499]: Applications are currently closed. Check out our latest projects and events to see what we're building.
        - generic [aria-hidden] [ref=e500]:
          - generic [ref=e501]: Applications
          - generic [ref=e503]: are
          - generic [ref=e505]: currently
          - generic [ref=e507]: closed.
          - generic [ref=e509]: Check
          - generic [ref=e511]: out
          - generic [ref=e513]: our
          - generic [ref=e515]: latest
          - generic [ref=e517]: projects
          - generic [ref=e519]: and
          - generic [ref=e521]: events
          - generic [ref=e523]: to
          - generic [ref=e525]: see
          - generic [ref=e527]: what
          - generic [ref=e529]: we're
          - generic [ref=e531]: building.
      - generic [ref=e533]:
        - link "JOIN CLUB" [ref=e534] [cursor=pointer]:
          - /url: /recruitment
          - generic [ref=e535]:
            - generic [ref=e536]: JOIN CLUB
            - generic [aria-hidden] [ref=e537]:
              - generic [ref=e538]:
                - generic [ref=e539]: J
                - generic [ref=e540]: O
                - generic [ref=e541]: I
                - generic [ref=e542]: "N"
              - generic [ref=e543]:
                - generic [ref=e544]: C
                - generic [ref=e545]: L
                - generic [ref=e546]: U
                - generic [ref=e547]: B
        - link "PROJECTS" [ref=e551] [cursor=pointer]:
          - /url: /projects
          - generic [ref=e552]:
            - generic [ref=e553]: PROJECTS
            - generic [ref=e555]:
              - generic [ref=e556]: P
              - generic [ref=e557]: R
              - generic [ref=e558]: O
              - generic [ref=e559]: J
              - generic [ref=e560]: E
              - generic [ref=e561]: C
              - generic [ref=e562]: T
              - generic [ref=e563]: S
    - region "Community voices" [ref=e564]:
      - generic [ref=e565]:
        - heading "THE VOICES OF NUCLEUS" [level=2] [ref=e566]:
          - generic [aria-hidden] [ref=e568]:
            - generic [ref=e569]:
              - generic [ref=e570]: T
              - generic [ref=e571]: H
              - generic [ref=e572]: E
            - generic [ref=e573]:
              - generic [ref=e574]: V
              - generic [ref=e575]: O
              - generic [ref=e576]: I
              - generic [ref=e577]: C
              - generic [ref=e578]: E
              - generic [ref=e579]: S
            - generic [ref=e580]:
              - generic [ref=e581]: O
              - generic [ref=e582]: F
            - generic [ref=e583]:
              - generic [ref=e584]: "N"
              - generic [ref=e585]: U
              - generic [ref=e586]: C
              - generic [ref=e587]: L
              - generic [ref=e588]: E
              - generic [ref=e589]: U
              - generic [ref=e590]: S
        - button "Pause moving voices" [ref=e591] [cursor=pointer]
      - region "Community voices, first row" [ref=e592]:
        - generic [ref=e593]:
          - generic [ref=e594]:
            - generic [ref=e595]:
              - generic [aria-hidden] [ref=e596]: K
              - generic [ref=e597]:
                - paragraph [ref=e598]: Ken Masters
                - paragraph [ref=e599]: "@kmasters"
            - paragraph [ref=e600]: “Our productivity has nearly doubled since onboarding. Automation features removed repetitive tasks, allowing our team to focus on building instead of managing operations.”
          - generic [ref=e601]:
            - generic [ref=e602]:
              - generic [aria-hidden] [ref=e603]: K
              - generic [ref=e604]:
                - paragraph [ref=e605]: Kira Athrun
                - paragraph [ref=e606]: "@kathrun"
            - paragraph [ref=e607]: “What surprised us most was how quickly our team adapted. Minimal learning curve, excellent documentation, and powerful features make it a must-have for modern SaaS companies.”
          - generic [ref=e608]:
            - generic [ref=e609]:
              - generic [aria-hidden] [ref=e610]: L
              - generic [ref=e611]:
                - paragraph [ref=e612]: Lirael Nassun
                - paragraph [ref=e613]: "@lnassun"
            - paragraph [ref=e614]: “This is easily one of the most reliable SaaS tools we’ve adopted. The UI is intuitive, integrations are seamless, and it saves us countless hours every week.”
          - generic [ref=e615]:
            - generic [ref=e616]:
              - generic [aria-hidden] [ref=e617]: J
              - generic [ref=e618]:
                - paragraph [ref=e619]: Jessica
                - paragraph [ref=e620]: "@jessica"
            - paragraph [ref=e621]: “Switching to this platform streamlined our entire workflow. Setup was effortless, performance improved instantly, and our team now ships features faster without worrying about infrastructure.”
          - generic [ref=e622]:
            - generic [ref=e623]:
              - generic [aria-hidden] [ref=e624]: J
              - generic [ref=e625]:
                - paragraph [ref=e626]: Jenny
                - paragraph [ref=e627]: "@jenny"
            - paragraph [ref=e628]: “We evaluated multiple solutions, but this stood out immediately. It’s fast, scalable, and thoughtfully designed for growing teams that need stability without added complexity.”
        - generic [aria-hidden] [ref=e629]:
          - generic [ref=e630]:
            - generic [ref=e631]:
              - generic [aria-hidden] [ref=e632]: K
              - generic [ref=e633]:
                - paragraph [ref=e634]: Ken Masters
                - paragraph [ref=e635]: "@kmasters"
            - paragraph [ref=e636]: “Our productivity has nearly doubled since onboarding. Automation features removed repetitive tasks, allowing our team to focus on building instead of managing operations.”
          - generic [ref=e637]:
            - generic [ref=e638]:
              - generic [aria-hidden] [ref=e639]: K
              - generic [ref=e640]:
                - paragraph [ref=e641]: Kira Athrun
                - paragraph [ref=e642]: "@kathrun"
            - paragraph [ref=e643]: “What surprised us most was how quickly our team adapted. Minimal learning curve, excellent documentation, and powerful features make it a must-have for modern SaaS companies.”
          - generic [ref=e644]:
            - generic [ref=e645]:
              - generic [aria-hidden] [ref=e646]: L
              - generic [ref=e647]:
                - paragraph [ref=e648]: Lirael Nassun
                - paragraph [ref=e649]: "@lnassun"
            - paragraph [ref=e650]: “This is easily one of the most reliable SaaS tools we’ve adopted. The UI is intuitive, integrations are seamless, and it saves us countless hours every week.”
          - generic [ref=e651]:
            - generic [ref=e652]:
              - generic [aria-hidden] [ref=e653]: J
              - generic [ref=e654]:
                - paragraph [ref=e655]: Jessica
                - paragraph [ref=e656]: "@jessica"
            - paragraph [ref=e657]: “Switching to this platform streamlined our entire workflow. Setup was effortless, performance improved instantly, and our team now ships features faster without worrying about infrastructure.”
          - generic [ref=e658]:
            - generic [ref=e659]:
              - generic [aria-hidden] [ref=e660]: J
              - generic [ref=e661]:
                - paragraph [ref=e662]: Jenny
                - paragraph [ref=e663]: "@jenny"
            - paragraph [ref=e664]: “We evaluated multiple solutions, but this stood out immediately. It’s fast, scalable, and thoughtfully designed for growing teams that need stability without added complexity.”
      - region "Community voices, second row" [ref=e665]:
        - generic [ref=e666]:
          - generic [ref=e667]:
            - generic [ref=e668]:
              - generic [aria-hidden] [ref=e669]: J
              - generic [ref=e670]:
                - paragraph [ref=e671]: Jenny
                - paragraph [ref=e672]: "@jenny"
            - paragraph [ref=e673]: “We evaluated multiple solutions, but this stood out immediately. It’s fast, scalable, and thoughtfully designed for growing teams that need stability without added complexity.”
          - generic [ref=e674]:
            - generic [ref=e675]:
              - generic [aria-hidden] [ref=e676]: J
              - generic [ref=e677]:
                - paragraph [ref=e678]: Jessica
                - paragraph [ref=e679]: "@jessica"
            - paragraph [ref=e680]: “Switching to this platform streamlined our entire workflow. Setup was effortless, performance improved instantly, and our team now ships features faster without worrying about infrastructure.”
          - generic [ref=e681]:
            - generic [ref=e682]:
              - generic [aria-hidden] [ref=e683]: L
              - generic [ref=e684]:
                - paragraph [ref=e685]: Lirael Nassun
                - paragraph [ref=e686]: "@lnassun"
            - paragraph [ref=e687]: “This is easily one of the most reliable SaaS tools we’ve adopted. The UI is intuitive, integrations are seamless, and it saves us countless hours every week.”
          - generic [ref=e688]:
            - generic [ref=e689]:
              - generic [aria-hidden] [ref=e690]: K
              - generic [ref=e691]:
                - paragraph [ref=e692]: Kira Athrun
                - paragraph [ref=e693]: "@kathrun"
            - paragraph [ref=e694]: “What surprised us most was how quickly our team adapted. Minimal learning curve, excellent documentation, and powerful features make it a must-have for modern SaaS companies.”
          - generic [ref=e695]:
            - generic [ref=e696]:
              - generic [aria-hidden] [ref=e697]: K
              - generic [ref=e698]:
                - paragraph [ref=e699]: Ken Masters
                - paragraph [ref=e700]: "@kmasters"
            - paragraph [ref=e701]: “Our productivity has nearly doubled since onboarding. Automation features removed repetitive tasks, allowing our team to focus on building instead of managing operations.”
        - generic [aria-hidden] [ref=e702]:
          - generic [ref=e703]:
            - generic [ref=e704]:
              - generic [aria-hidden] [ref=e705]: J
              - generic [ref=e706]:
                - paragraph [ref=e707]: Jenny
                - paragraph [ref=e708]: "@jenny"
            - paragraph [ref=e709]: “We evaluated multiple solutions, but this stood out immediately. It’s fast, scalable, and thoughtfully designed for growing teams that need stability without added complexity.”
          - generic [ref=e710]:
            - generic [ref=e711]:
              - generic [aria-hidden] [ref=e712]: J
              - generic [ref=e713]:
                - paragraph [ref=e714]: Jessica
                - paragraph [ref=e715]: "@jessica"
            - paragraph [ref=e716]: “Switching to this platform streamlined our entire workflow. Setup was effortless, performance improved instantly, and our team now ships features faster without worrying about infrastructure.”
          - generic [ref=e717]:
            - generic [ref=e718]:
              - generic [aria-hidden] [ref=e719]: L
              - generic [ref=e720]:
                - paragraph [ref=e721]: Lirael Nassun
                - paragraph [ref=e722]: "@lnassun"
            - paragraph [ref=e723]: “This is easily one of the most reliable SaaS tools we’ve adopted. The UI is intuitive, integrations are seamless, and it saves us countless hours every week.”
          - generic [ref=e724]:
            - generic [ref=e725]:
              - generic [aria-hidden] [ref=e726]: K
              - generic [ref=e727]:
                - paragraph [ref=e728]: Kira Athrun
                - paragraph [ref=e729]: "@kathrun"
            - paragraph [ref=e730]: “What surprised us most was how quickly our team adapted. Minimal learning curve, excellent documentation, and powerful features make it a must-have for modern SaaS companies.”
          - generic [ref=e731]:
            - generic [ref=e732]:
              - generic [aria-hidden] [ref=e733]: K
              - generic [ref=e734]:
                - paragraph [ref=e735]: Ken Masters
                - paragraph [ref=e736]: "@kmasters"
            - paragraph [ref=e737]: “Our productivity has nearly doubled since onboarding. Automation features removed repetitive tasks, allowing our team to focus on building instead of managing operations.”
  - contentinfo [ref=e738]:
    - generic [ref=e739]:
      - link "Nucleus home" [ref=e740] [cursor=pointer]:
        - /url: /
        - generic [ref=e743]:
          - text: NUCLEUS
          - generic [ref=e744]: SJEC · MANGALURU
      - generic [ref=e745]:
        - link "Nucleus Instagram" [ref=e746] [cursor=pointer]:
          - /url: https://www.instagram.com/nucleus_sjec/
        - link "Nucleus LinkedIn" [ref=e750] [cursor=pointer]:
          - /url: https://www.linkedin.com/company/nucleus-sjec/
        - link "Nucleus GitHub" [ref=e755] [cursor=pointer]:
          - /url: https://github.com/nucleus-sjec
        - link "Email Nucleus" [ref=e759] [cursor=pointer]:
          - /url: mailto:nucleussjec@gmail.com
    - generic [ref=e763]:
      - generic [ref=e764]: © 2026 Nucleus SJEC
      - generic [ref=e765]: Made of many minds.
      - link "Admin" [ref=e766] [cursor=pointer]:
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
  166 | test('navigation mounts the tower behind the bands before the delayed exit', async ({ page }) => {
  167 |   await page.clock.install({ time: new Date('2026-10-02T12:00:00Z') });
  168 |   await page.goto('/recruitment');
  169 |   await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done', { timeout: 15000 });
  170 |   await toggle(page).click();
  171 |   await settledOpen(page);
  172 |   await expect(page.locator('.morph-nav__footer > div').last()).toHaveCSS('opacity', '1');
  173 |   await page.clock.pauseAt(new Date('2026-10-02T12:01:00Z'));
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
```