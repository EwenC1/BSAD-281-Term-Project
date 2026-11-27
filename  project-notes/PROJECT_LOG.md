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

| Date | What went wrong | What I tried | What fixed it |
|---|---|---|---|
| Nov. 25 | Clicking the icons on the map didn't update the travel details. | I tried to get the AI to use a different map rather than Google Maps, one that didn't require an API to function. The map it tried to use instead wouldn't load on the website. | I asked the AI to reference Google Maps to create its own map of Antigonish. |
| Nov. 26 | The corporate feel didn't come out how I wanted it to. | I asked it to tweak some aspects. | I asked Copilot for specific visual changes until the corporate feel was closer to what I wanted. |
| Nov. 27 | When I was adding the more relevant highlighted locations, they were a different colour and style than the previously existing ones. | I tried to match the new locations to the existing ones. | I just made the new locations match the existing ones. |

## What A Real Company Needs

| Feature skipped or faked | Why a real company needs it | How hard or expensive it is |
|---|---|---|
| Real number of active drivers | To show an accurate number of active drivers and build customer confidence. | Not difficult or expensive. You just need to track driver status through the app. |
| Proper payment processing | To formally process payments accurately and generate revenue. | Not hard. Pay a company like PayPal to process payments for a monthly subscription or transaction fee. |
| Live GPS to track drivers | To keep track of drivers and get more accurate pickup and drop-off times. | Not difficult, but relatively expensive. Google Maps Platform charges a few hundred dollars monthly. |
| Calculated pricing and fees | To optimize revenue to the maximum point a customer is willing to pay. | Not hard. You just need to do some basic calculations or test the market to find the optimal pricing. |
| Database that stores driver information | Important to keep track of who is working and representing the company, especially if anything goes wrong, like a car accident. | Not hard. Pay a fee to rent a server in the cloud to store the data. |

## Reflection
1. What surprised you most about building software with AI?

The biggest surprise I encountered was how good Copilot is at entry-level coding. All the business podcasts and media I take in have mentioned how capable AI has become at coding. Additionally, I've heard a lot about how difficult it is becoming for recent computer science graduates to find entry-level jobs. I originally thought some of this was fearmongering, but this exercise has impressed me with what AI is capable of. To be clear, I don't know exactly what an entry-level coding position requires, but this experience does make me wonder how much a new graduate can do that AI can't. 

2. Which parts were easy, and which were hard? Why do you think that is?

The easiest part was generating the initial UI for the website. I asked Copilot for a modern, sleek-looking interface, and the first option it gave me was exactly what I was looking for. The hardest part was making the map look accurate and ensuring it had the proper functionality. I could get the map to look accurate using Google Maps, but the "Quick Click" feature wouldn't work. Other times, I would get the feature to work, but the map itself would display a large error code. Eventually, I got it working by asking the AI to generate its own map. I think this was more difficult because I was asking it to complete a more complex task that required more specific instructions than I was originally giving it.

3. If a competitor had the same AI tool, how long would it take them to copy your site?

If you gave them the right prompts to ask the AI, I don't think it would take more than twenty minutes. I spent a long time going back on decisions I made about the website, especially the map. I probably went through six or seven different variations of the map and its functionality before settling on what I wanted. If I were a competitor looking at what I created, I wouldn't be worried about not being able to replicate it. This made me realize that the website itself isn't what would make Anti-Walk difficult to compete with, but rather the relationships and networks I would have to build around it.