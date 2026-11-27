# PROJECT LOG

**Ewen Cameron**
**ANTI-WALK**
**https://cautious-broccoli-wv47r7ww99xx39qq-5504.app.github.dev/**

## Work sessions
### Session 1 -- Nov 25 -- driver: Ewen

- Goal for this session: Create a rough copy of the app
- Key prompts I gave Copilot:
  1. Gave my idea to the AI to see what it would come up with
  2. Added a map of antigonish 
- What Worked: The AI added google maps to the website, I'm able to move around Antigonish freely
- What broke, and how I fixed it: Thankfully nothing "Broke" as there was little to be broken
- Committed? yes

### Session 2 -- Nov 25 -- driver: Ewen

- Goal for this session: Develop the app
- Key prompts I gave Copilot:
  1. Make your own detailed interactive map of antigonish
  2. Create the "Where to" UI
- What worked: The inital request for the style and purpose of the website was very good, especally the "Where to" UI.
- What broke, and how I fixed it: The map. I couldn't get the map to be as interactive as I wanted. I wanted the user to be able to select a location on the map and have the "Where to" section update with what they selected. The AI tried to use Google maps but it needed an API to be running, so it tried something else that didnt need one, but it wouldnt give the website access to the map. I ended up telling the AI to make its own map of antigonish and I think it turned out pretty good.
- Committed? yes

### Session 3 -- Nov 26 -- driver: Ewen

- Goal for this session: Clean the app up
- Key prompts I gave Copilot:
  1. I asked Copilot to give the app a more corporate feel
  2. I asked Copilot to create seperate pages on the sight for each of the functions, ex "how it works"
- What worked:The different pages worked instantly
- What broke, and how I fixed it: The corporate feel didnt come out how I wanted it to, I just asked it to tweek some aspects.
- Committed? yes

### Session 4 -- Nov 27 -- driver: Ewen
- Goal for this session: Finalize the app
- Key prompts I gave Copilot:
  1. Changed the "quick" highlighted locations on the map to the most relevent
  2. Made the icons on the map more accurate 
- What worked:Making the map more accurate worked on the first time trying 
- What broke, and how I fixed it: When I was adding the more relevent highlighted locations they were a different colour and style than the previously exsisting ones. I just made it match the exsisting ones
- Committed? yes

## Things that broke
Date       What Went Wrong:            What I tried:                            What Fixed it:

1. NOV 25  Clicking the Icons          I tried to get the AI to use a           I asked the AI to reference
           on the map didnt update     different map rather than Google         google maps to create its own
           the travel details          maps, one that didnt require an API      map to Antigonish
                                       to function. The map it tried to use 
                                       instead wouldn't load on the website

## What A Real Company Needs
Feature skipped or faked:             Why A Real Company Needs It:             How Hard/Expensive:

1. Real number of active drivers      To show an accurate number of            Not difficult or expensive
                                      active drivers to build                  you just need to track via
                                      customer confidence                      app status

2. Proper Payment Processing          To formally process payments             Not hard, pay a company ei Paypal
                                      accuratly to generate revenue            to process payments for a monthly  
                                                                               subscription or transaction fee

3. Live GPS to track Drivers          To keep track of drivers and             Not difficult, but realativly
                                      get more accurate pick up/               expensive. Google Maps Platform
                                      drop off times                           charges a few hundred monthly

4. Calculated pricing & Fees          To optimize revenue to the               Not hard, you just need to do some
                                      max point a customer is willing          basic precal or test the market to
                                      to pay                                   find the optimal pricing

5. Database that stores driver info   Important to keep track of who           Not hard, pay a fee to rent a 
                                      is working/representing your             server in the cloud to store
                                      company. Especially if anything          your data.
                                      goes wrong, ex, car accident

## Reflection