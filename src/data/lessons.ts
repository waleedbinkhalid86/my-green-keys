export interface Lesson {
  id: number;
  phase: number;
  phaseName: string;
  title: string;
  newKeys: string[];
  drill: string;
  sentence: string;
  module: 'typing' | 'eco' | 'health' | 'manners';
  targetWPM?: number;
}

export const lessons: Lesson[] = [
  // PHASE 1 - HOME ROW (1-20)
  { id: 1, phase: 1, phaseName: 'Home Row', title: 'Meet the A and S keys', newKeys: ['A', 'S'], drill: 'aa ss aa ss aaa sss asa sas ssa aas', sentence: 'a sad sas asa ass', module: 'typing' },
  { id: 2, phase: 1, phaseName: 'Home Row', title: 'Add the D key', newKeys: ['D'], drill: 'dd ad sd da ds dds aad ssd dad add', sentence: 'dad adds a sad dad', module: 'typing' },
  { id: 3, phase: 1, phaseName: 'Home Row', title: 'Add the F key', newKeys: ['F'], drill: 'ff af sf df fa fs fd fad fads daf', sentence: 'fads add a sad dad', module: 'typing' },
  { id: 4, phase: 1, phaseName: 'Home Row', title: 'Meet the J key', newKeys: ['J'], drill: 'jj aj sj dj fj ja js jd jf jaj jfj', sentence: 'jaf jad jaff daj', module: 'typing' },
  { id: 5, phase: 1, phaseName: 'Home Row', title: 'Add the K key', newKeys: ['K'], drill: 'kk ak sk dk fk jk ka ks kd kf kj ask', sentence: 'ask dad a sad flask', module: 'typing' },
  { id: 6, phase: 1, phaseName: 'Home Row', title: 'Add the L key', newKeys: ['L'], drill: 'll al sl dl fl jl kl la ls ld lf lj lk all', sentence: 'all dads ask a lad', module: 'typing' },
  { id: 7, phase: 1, phaseName: 'Home Row', title: 'Full Home Row Left Hand', newKeys: ['A', 'S', 'D', 'F'], drill: 'asdf fdsa asdf fdsa afsd dsfa fads adds', sentence: 'fads and dads fall', module: 'typing' },
  { id: 8, phase: 1, phaseName: 'Home Row', title: 'Full Home Row Right Hand', newKeys: ['J', 'K', 'L'], drill: 'jkl lkj jkl lkj jlk klj lkjj jjkl llkj', sentence: 'lads ask jal all', module: 'typing' },
  { id: 9, phase: 1, phaseName: 'Home Row', title: 'Both Hands Full Home Row', newKeys: ['A','S','D','F','J','K','L'], drill: 'asdf jkl; asdf jkl; fdsa ;lkj asjk dlsf', sentence: 'all lads ask dad flask', module: 'typing' },
  { id: 10, phase: 1, phaseName: 'Home Row', title: 'Add SPACE - First Real Words', newKeys: ['SPACE'], drill: 'a s d f j k l a s d f j k l', sentence: 'add all ask dad fall lads flask', module: 'typing' },
  { id: 11, phase: 1, phaseName: 'Home Row', title: 'Home Row Eco Words', newKeys: ['Review'], drill: 'add ask all fall lads flask salad', sentence: 'all lads ask dad to add a salad', module: 'eco' },
  { id: 12, phase: 1, phaseName: 'Home Row', title: 'Add the G key', newKeys: ['G'], drill: 'gg fg gf ag sg dg jg kg lg gal glad lag', sentence: 'glad lads ask dad all flags', module: 'typing' },
  { id: 13, phase: 1, phaseName: 'Home Row', title: 'Add the H key', newKeys: ['H'], drill: 'hh jh hj fh hf gh hg ah sh dh has had hall', sentence: 'has dad a glad hall flask', module: 'typing' },
  { id: 14, phase: 1, phaseName: 'Home Row', title: 'G and H Together', newKeys: ['G', 'H'], drill: 'gh hg ghj fgh jgh ghf ghl hgf glad has shall', sentence: 'shall glad lads add hash', module: 'typing' },
  { id: 15, phase: 1, phaseName: 'Home Row', title: 'Home Row Speed Drill', newKeys: ['Speed'], drill: 'asdf ghjkl asdf ghjkl fdsa lkjhg', sentence: 'glass flasks shall fall glad all', module: 'typing', targetWPM: 15 },
  { id: 16, phase: 1, phaseName: 'Home Row', title: 'Eco - Save the Land', newKeys: ['Eco'], drill: 'land lads flag glad hall fall glass', sentence: 'glad lads shall ask all flags fall', module: 'eco' },
  { id: 17, phase: 1, phaseName: 'Home Row', title: 'Health - Home Row', newKeys: ['Health'], drill: 'glad salad flask halls lads dash', sentence: 'add salad and glass flask for health', module: 'health' },
  { id: 18, phase: 1, phaseName: 'Home Row', title: 'Manners - Home Row', newKeys: ['Manners'], drill: 'shall ask glad has fall hall lads all', sentence: 'shall all lads ask dad glad', module: 'manners' },
  { id: 19, phase: 1, phaseName: 'Home Row', title: 'Home Row Accuracy Test', newKeys: ['Test'], drill: 'asdfghjkl lkjhgfdsa asdfghjkl', sentence: 'glass flasks shall glad fall halls lads ask', module: 'typing', targetWPM: 18 },
  { id: 20, phase: 1, phaseName: 'Home Row', title: 'Phase 1 Complete - Home Row Master!', newKeys: ['Master'], drill: 'asdfghjkl asdfghjkl fdsa lkjh ghfd jkls', sentence: 'all glad lads shall ask dad flask salad hall glass', module: 'eco', targetWPM: 20 },

  // PHASE 2 - TOP ROW (21-45)
  { id: 21, phase: 2, phaseName: 'Top Row', title: 'Add E key', newKeys: ['E'], drill: 'ee de ed se es ae ea fed led sea eel feel', sentence: 'feel the sea and heal the land', module: 'eco' },
  { id: 22, phase: 2, phaseName: 'Top Row', title: 'Add I key', newKeys: ['I'], drill: 'ii ki ik ji ij li il aid did kid lid did fill', sentence: 'kids did fill a glass field', module: 'health' },
  { id: 23, phase: 2, phaseName: 'Top Row', title: 'E and I together', newKeys: ['E', 'I'], drill: 'ei ie fie die lie hie field feels ideal', sentence: 'ideal fields feel like a dream', module: 'eco' },
  { id: 24, phase: 2, phaseName: 'Top Row', title: 'Add R key', newKeys: ['R'], drill: 'rr fr rf ar ra sr rs dr rd real read rare', sentence: 'real trees are rare read all', module: 'eco' },
  { id: 25, phase: 2, phaseName: 'Top Row', title: 'Add U key', newKeys: ['U'], drill: 'uu ju uj ku uk lu ul dull full hull rule', sentence: 'full rule of lush green jungle', module: 'eco' },
  { id: 26, phase: 2, phaseName: 'Top Row', title: 'Add T key', newKeys: ['T'], drill: 'tt ft tf at ta st ts dt td tree talk tall', sentence: 'tall trees talk to the stars', module: 'eco' },
  { id: 27, phase: 2, phaseName: 'Top Row', title: 'Add Y key', newKeys: ['Y'], drill: 'yy jy yj ky yk ly yl yes yet year yield', sentence: 'yes this year yield green fields', module: 'eco' },
  { id: 28, phase: 2, phaseName: 'Top Row', title: 'Add W key', newKeys: ['W'], drill: 'ww sw ws aw wa dw wd water well wild walk', sentence: 'walk wild and water the well', module: 'eco' },
  { id: 29, phase: 2, phaseName: 'Top Row', title: 'Add O key', newKeys: ['O'], drill: 'oo lo ol ko ok jo oj old oak soil road', sentence: 'old oak soil road hold gold', module: 'eco' },
  { id: 30, phase: 2, phaseName: 'Top Row', title: 'Add Q key', newKeys: ['Q'], drill: 'qq aq qa sq qs dq qd quiet quite quail', sentence: 'quite quiet quail walk the trail', module: 'eco' },
  { id: 31, phase: 2, phaseName: 'Top Row', title: 'Add P key', newKeys: ['P'], drill: 'pp lp pl kp pk jp pj plant pure pure path', sentence: 'pure plant path fills our world', module: 'eco' },
  { id: 32, phase: 2, phaseName: 'Top Row', title: 'Full Top Row Left Hand', newKeys: ['Q','W','E','R','T'], drill: 'qwert trewq qwert water tree real quest', sentence: 'water trees are a real quest', module: 'eco' },
  { id: 33, phase: 2, phaseName: 'Top Row', title: 'Full Top Row Right Hand', newKeys: ['Y','U','I','O','P'], drill: 'yuiop poiuy yuiop your pure your pour', sentence: 'your pure oil pour helps our pole', module: 'eco' },
  { id: 34, phase: 2, phaseName: 'Top Row', title: 'Full Top Row Both Hands', newKeys: ['All top row'], drill: 'qwertyuiop poiuytrewq type your words', sentence: 'type your words to help our world', module: 'typing', targetWPM: 20 },
  { id: 35, phase: 2, phaseName: 'Top Row', title: 'Top Row Eco Sentence', newKeys: ['Eco'], drill: 'trees water soil root quiet pure old', sentence: 'water the tree roots quietly in pure soil', module: 'eco' },
  { id: 36, phase: 2, phaseName: 'Top Row', title: 'Top Row Health Lesson', newKeys: ['Health'], drill: 'rest sleep fruit juice drink water daily', sentence: 'drink pure fruit juice and rest well daily', module: 'health' },
  { id: 37, phase: 2, phaseName: 'Top Row', title: 'Top Row Manners Lesson', newKeys: ['Manners'], drill: 'polite quiet greet people with warmth', sentence: 'greet people with a warm polite word', module: 'manners' },
  { id: 38, phase: 2, phaseName: 'Top Row', title: 'Home and Top Row Mix', newKeys: ['Mix'], drill: 'asdf qwer jkl; yuiop trees water soil', sentence: 'fresh water fills the great old well', module: 'eco' },
  { id: 39, phase: 2, phaseName: 'Top Row', title: 'Real Words Drill', newKeys: ['Words'], drill: 'water trees soil air light growth', sentence: 'light air water soil grow our food', module: 'eco' },
  { id: 40, phase: 2, phaseName: 'Top Row', title: 'Speed Drill Top Row', newKeys: ['Speed'], drill: 'qwertyuiop asdfghjkl qwertyuiop', sentence: 'your pure water helps all our trees grow well', module: 'eco', targetWPM: 25 },
  { id: 41, phase: 2, phaseName: 'Top Row', title: 'Eco Story Part 1', newKeys: ['Story'], drill: 'plant water grow harvest share earth', sentence: 'plant a tree water it well and watch it grow tall', module: 'eco' },
  { id: 42, phase: 2, phaseName: 'Top Row', title: 'Health Story Part 1', newKeys: ['Story'], drill: 'sleep rest eat drink walk play outside', sentence: 'eat fresh fruit sleep well and play outside daily', module: 'health' },
  { id: 43, phase: 2, phaseName: 'Top Row', title: 'Manners Story Part 1', newKeys: ['Story'], drill: 'greet thank help share listen respect', sentence: 'greet your friends and help them with a kind word', module: 'manners' },
  { id: 44, phase: 2, phaseName: 'Top Row', title: 'Phase 2 Speed Test', newKeys: ['Test'], drill: 'qwertyuiop asdfghjkl water trees growth', sentence: 'pure water helps all our trees and plants to grow well', module: 'eco', targetWPM: 28 },
  { id: 45, phase: 2, phaseName: 'Top Row', title: 'Phase 2 Complete - Top Row Master!', newKeys: ['Master'], drill: 'the quick red fox leapt over the quiet hill', sentence: 'water the trees and protect our wild and pure earth', module: 'eco', targetWPM: 30 },

  // PHASE 3 - BOTTOM ROW (46-65)
  { id: 46, phase: 3, phaseName: 'Bottom Row', title: 'Add N key', newKeys: ['N'], drill: 'nn jn nj kn nk ln nl and land sand nature', sentence: 'nature and land need kind hands', module: 'eco' },
  { id: 47, phase: 3, phaseName: 'Bottom Row', title: 'Add M key', newKeys: ['M'], drill: 'mm jm mj km mk lm ml man make more', sentence: 'make more green and natural land', module: 'eco' },
  { id: 48, phase: 3, phaseName: 'Bottom Row', title: 'Add C key', newKeys: ['C'], drill: 'cc dc cd sc cs ac ca clean care cool', sentence: 'clean cool water cares for all life', module: 'eco' },
  { id: 49, phase: 3, phaseName: 'Bottom Row', title: 'Add V key', newKeys: ['V'], drill: 'vv fv vf av va sv vs dv vd vine vivid', sentence: 'vivid green vines cover the walls', module: 'eco' },
  { id: 50, phase: 3, phaseName: 'Bottom Row', title: 'Add B key', newKeys: ['B'], drill: 'bb fb bf ab ba sb bs db bd bird bear', sentence: 'birds and bears need clean forests', module: 'eco' },
  { id: 51, phase: 3, phaseName: 'Bottom Row', title: 'Add X key', newKeys: ['X'], drill: 'xx sx xs ax xa dx xd ox box fox fix mix', sentence: 'fix and mix the soil in the box', module: 'eco' },
  { id: 52, phase: 3, phaseName: 'Bottom Row', title: 'Add Z key', newKeys: ['Z'], drill: 'zz az za sz zs dz zd zero zone zeal', sentence: 'zero waste zones protect our earth', module: 'eco' },
  { id: 53, phase: 3, phaseName: 'Bottom Row', title: 'Full Bottom Row', newKeys: ['All bottom'], drill: 'zxcvbnm mnbvcxz zxcvbnm zinc bronze', sentence: 'zinc bronze and carbon come from the earth', module: 'eco' },
  { id: 54, phase: 3, phaseName: 'Bottom Row', title: 'All Three Rows Combined', newKeys: ['All rows'], drill: 'qwerty asdfgh zxcvbn nature climate', sentence: 'nature and climate need our combined care', module: 'eco' },
  { id: 55, phase: 3, phaseName: 'Bottom Row', title: 'Eco Story - Clean Ocean', newKeys: ['Story'], drill: 'clean ocean waves birds fish marine', sentence: 'clean oceans give marine birds and fish a safe home', module: 'eco' },
  { id: 56, phase: 3, phaseName: 'Bottom Row', title: 'Health - Exercise', newKeys: ['Health'], drill: 'move jump run climb swim bike walk', sentence: 'move your body run jump swim and climb every day', module: 'health' },
  { id: 57, phase: 3, phaseName: 'Bottom Row', title: 'Manners - Kindness', newKeys: ['Manners'], drill: 'kind brave calm nice warm help share', sentence: 'be kind brave and calm and share with everyone', module: 'manners' },
  { id: 58, phase: 3, phaseName: 'Bottom Row', title: 'Common Words Drill', newKeys: ['Words'], drill: 'the and for are but not you all can her', sentence: 'the trees and the birds can all live here', module: 'eco' },
  { id: 59, phase: 3, phaseName: 'Bottom Row', title: 'Punctuation Period and Comma', newKeys: ['.', ','], drill: 'a, b, c. d, e, f. trees, birds, fish.', sentence: 'trees, birds, and fish all need clean water.', module: 'eco' },
  { id: 60, phase: 3, phaseName: 'Bottom Row', title: 'Phase 3 Complete - Full Keyboard!', newKeys: ['Master'], drill: 'the quick brown fox jumps over the lazy dog', sentence: 'we must protect our clean green planet for all living things.', module: 'eco', targetWPM: 30 },

  // PHASE 4 - NUMBERS (61-70)
  { id: 61, phase: 4, phaseName: 'Numbers', title: 'Numbers 1 and 2', newKeys: ['1', '2'], drill: '1 2 1 2 11 22 12 21 1 tree 2 trees', sentence: 'plant 1 tree today and 2 more tomorrow', module: 'eco' },
  { id: 62, phase: 4, phaseName: 'Numbers', title: 'Numbers 3 and 4', newKeys: ['3', '4'], drill: '3 4 33 44 34 43 3 birds 4 nests', sentence: '3 birds made 4 nests in the tree', module: 'eco' },
  { id: 63, phase: 4, phaseName: 'Numbers', title: 'Numbers 5 and 6', newKeys: ['5', '6'], drill: '5 6 55 66 56 65 5 fish 6 oceans', sentence: '5 fish swim in 6 clean ocean zones', module: 'eco' },
  { id: 64, phase: 4, phaseName: 'Numbers', title: 'Numbers 7 and 8', newKeys: ['7', '8'], drill: '7 8 77 88 78 87 7 days 8 hours', sentence: 'sleep 8 hours and exercise 7 days a week', module: 'health' },
  { id: 65, phase: 4, phaseName: 'Numbers', title: 'Numbers 9 and 0', newKeys: ['9', '0'], drill: '9 0 99 00 90 09 9 plants 0 waste', sentence: 'grow 9 plants and produce 0 waste today', module: 'eco' },
  { id: 66, phase: 4, phaseName: 'Numbers', title: 'All Numbers Drill', newKeys: ['All numbers'], drill: '1234567890 0987654321 1234567890', sentence: 'there are 8 million species on our planet earth', module: 'eco' },
  { id: 67, phase: 4, phaseName: 'Numbers', title: 'Numbers with Words', newKeys: ['Mix'], drill: '1 tree 2 birds 3 fish 4 rivers 5 lakes', sentence: 'plant 10 trees and save 100 animals this year', module: 'eco' },
  { id: 68, phase: 4, phaseName: 'Numbers', title: 'Eco Facts with Numbers', newKeys: ['Facts'], drill: '70 percent of earth is covered by water', sentence: '70 percent of our earth is covered by water and oceans', module: 'eco' },
  { id: 69, phase: 4, phaseName: 'Numbers', title: 'Health Facts with Numbers', newKeys: ['Facts'], drill: 'drink 8 glasses of water every single day', sentence: 'drink 8 glasses of water and sleep 8 hours daily', module: 'health' },
  { id: 70, phase: 4, phaseName: 'Numbers', title: 'Phase 4 Complete - Numbers Master!', newKeys: ['Master'], drill: '1234567890 plant 1 tree save 100 animals', sentence: 'if 1000 kids each plant 5 trees that is 5000 new trees', module: 'eco', targetWPM: 32 },

  // PHASE 5 - CAPITALS (71-85)
  { id: 71, phase: 5, phaseName: 'Capitals', title: 'Left Shift Capitals J K L', newKeys: ['SHIFT', 'J', 'K', 'L'], drill: 'Jj Kk Ll Jal Kale Lake Jade Like', sentence: 'Jade and Kale grow in our Lake garden', module: 'eco' },
  { id: 72, phase: 5, phaseName: 'Capitals', title: 'Right Shift Capitals A S D F', newKeys: ['SHIFT', 'A', 'S', 'D', 'F'], drill: 'Aa Ss Dd Ff Adam Sara Dave Frank', sentence: 'Sara and Adam help Dave plant a Farm', module: 'eco' },
  { id: 73, phase: 5, phaseName: 'Capitals', title: 'Capital Letters Names', newKeys: ['Names'], drill: 'Earth Ocean River Forest Mountain Lake', sentence: 'Earth our Ocean River Forest Mountain and Lake', module: 'eco' },
  { id: 74, phase: 5, phaseName: 'Capitals', title: 'Sentences with Capitals', newKeys: ['Sentences'], drill: 'Trees grow tall. Water flows fast. Birds sing.', sentence: 'Trees grow tall. Water flows. Birds sing every day.', module: 'eco' },
  { id: 75, phase: 5, phaseName: 'Capitals', title: 'Add Question Mark', newKeys: ['?'], drill: 'What? Where? When? Why? How? Who?', sentence: 'Why do we need to protect our forests and rivers?', module: 'eco' },
  { id: 76, phase: 5, phaseName: 'Capitals', title: 'Add Exclamation Mark', newKeys: ['!'], drill: 'Yes! Great! Amazing! Save the planet!', sentence: 'Save the trees! Protect our oceans! Help wildlife!', module: 'eco' },
  { id: 77, phase: 5, phaseName: 'Capitals', title: 'Full Sentences with Punctuation', newKeys: ['Mix'], drill: 'We love trees! Do you? Yes, we do!', sentence: 'We love our planet! Do you care? Yes, we all must!', module: 'eco' },
  { id: 78, phase: 5, phaseName: 'Capitals', title: 'Eco Paragraph', newKeys: ['Paragraph'], drill: 'Trees give us oxygen. We need clean air to live.', sentence: 'Trees give us oxygen. We need clean air to live and grow healthy.', module: 'eco' },
  { id: 79, phase: 5, phaseName: 'Capitals', title: 'Health Paragraph', newKeys: ['Paragraph'], drill: 'Eat well. Sleep long. Exercise daily. Drink water.', sentence: 'Eat well. Sleep long. Exercise daily. Drink clean water every day.', module: 'health' },
  { id: 80, phase: 5, phaseName: 'Capitals', title: 'Manners Paragraph', newKeys: ['Paragraph'], drill: 'Be kind. Say thanks. Help others. Share your gifts.', sentence: 'Be kind. Say thanks. Help others. Share your gifts with a smile.', module: 'manners' },
  { id: 81, phase: 5, phaseName: 'Capitals', title: 'All Capitals Speed', newKeys: ['Speed'], drill: 'The Earth needs Our Help Now More Than Ever', sentence: 'The Earth needs our help now more than ever before.', module: 'eco', targetWPM: 30 },
  { id: 82, phase: 5, phaseName: 'Capitals', title: 'Eco Heroes', newKeys: ['Names'], drill: 'Greta Sara Omar Fatima Ali help save Earth', sentence: 'Greta Sara Omar Fatima and Ali all help save Earth!', module: 'eco' },
  { id: 83, phase: 5, phaseName: 'Capitals', title: 'Health Heroes', newKeys: ['Names'], drill: 'Doctor Sara helps kids stay healthy and strong', sentence: 'Doctor Sara helps all kids stay healthy strong and happy.', module: 'health' },
  { id: 84, phase: 5, phaseName: 'Capitals', title: 'Manners Heroes', newKeys: ['Names'], drill: 'Kind Omar always helps his friends and family', sentence: 'Kind Omar always helps his friends family and neighbors.', module: 'manners' },
  { id: 85, phase: 5, phaseName: 'Capitals', title: 'Phase 5 Complete - Capitals Master!', newKeys: ['Master'], drill: 'My Green Keys helps kids learn to type and save Earth!', sentence: 'My Green Keys helps all kids learn to type and save our Earth!', module: 'eco', targetWPM: 35 },

  // PHASE 6 - SPEED (86-100)
  { id: 86, phase: 6, phaseName: 'Speed', title: 'Speed Drill 1 Common Words', newKeys: ['Speed'], drill: 'the and for are with that this from they', sentence: 'the trees and rivers are the heart of our living world', module: 'eco', targetWPM: 30 },
  { id: 87, phase: 6, phaseName: 'Speed', title: 'Eco Speed Climate', newKeys: ['Speed'], drill: 'climate change affects all life on our planet today', sentence: 'climate change is the biggest challenge facing our planet today', module: 'eco', targetWPM: 32 },
  { id: 88, phase: 6, phaseName: 'Speed', title: 'Health Speed Body Care', newKeys: ['Speed'], drill: 'exercise sleep nutrition water rest mental health', sentence: 'exercise daily eat well sleep enough and drink plenty of water', module: 'health', targetWPM: 32 },
  { id: 89, phase: 6, phaseName: 'Speed', title: 'Manners Speed Character', newKeys: ['Speed'], drill: 'kindness empathy respect honesty courage patience', sentence: 'show kindness empathy and respect to everyone you meet', module: 'manners', targetWPM: 32 },
  { id: 90, phase: 6, phaseName: 'Speed', title: 'The Quick Brown Fox', newKeys: ['Classic'], drill: 'the quick brown fox jumps over the lazy dog', sentence: 'the quick brown fox jumps over the lazy dog by the river', module: 'typing', targetWPM: 35 },
  { id: 91, phase: 6, phaseName: 'Speed', title: 'Eco Story Rainforest', newKeys: ['Story'], drill: 'rainforests are home to millions of plants and animals', sentence: 'rainforests are home to millions of plants animals and insects worldwide', module: 'eco', targetWPM: 35 },
  { id: 92, phase: 6, phaseName: 'Speed', title: 'Eco Story Ocean', newKeys: ['Story'], drill: 'our oceans cover 70 percent of earth and support all life', sentence: 'our oceans cover 70 percent of earth and support billions of living things', module: 'eco', targetWPM: 35 },
  { id: 93, phase: 6, phaseName: 'Speed', title: 'Health Story Growing Up', newKeys: ['Story'], drill: 'growing up healthy means eating well sleeping and exercising', sentence: 'growing up healthy means eating well sleeping long and exercising every day', module: 'health', targetWPM: 38 },
  { id: 94, phase: 6, phaseName: 'Speed', title: 'Manners Story Digital World', newKeys: ['Story'], drill: 'be respectful online just as you are in real life always', sentence: 'be respectful kind and honest online just as you are in real life', module: 'manners', targetWPM: 38 },
  { id: 95, phase: 6, phaseName: 'Speed', title: 'Speed Challenge 30 WPM', newKeys: ['Challenge'], drill: 'every key you press brings us closer to a better world', sentence: 'every key you press brings us one step closer to a better world for all', module: 'eco', targetWPM: 30 },
  { id: 96, phase: 6, phaseName: 'Speed', title: 'Speed Challenge 35 WPM', newKeys: ['Challenge'], drill: 'typing is a skill that opens doors to knowledge and opportunity', sentence: 'typing is a skill that opens doors to knowledge creativity and opportunity', module: 'typing', targetWPM: 35 },
  { id: 97, phase: 6, phaseName: 'Speed', title: 'Speed Challenge 40 WPM', newKeys: ['Challenge'], drill: 'we can make the world a better place if we work together', sentence: 'we can make the world a better greener place if we all work together today', module: 'eco', targetWPM: 40 },
  { id: 98, phase: 6, phaseName: 'Speed', title: 'Master Eco Paragraph', newKeys: ['Master'], drill: 'protect our forests oceans and wildlife for future generations', sentence: 'protect our forests oceans and wildlife so future generations can enjoy them too', module: 'eco', targetWPM: 40 },
  { id: 99, phase: 6, phaseName: 'Speed', title: 'Grand Speed Challenge', newKeys: ['Grand'], drill: 'My Green Keys has made me a better typist and a better person', sentence: 'My Green Keys has made me a faster typist and a more caring person for our planet', module: 'eco', targetWPM: 45 },
  { id: 100, phase: 6, phaseName: 'Speed', title: 'GRADUATION - My Green Keys Champion!', newKeys: ['Champion'], drill: 'I learned to type and I will help save our beautiful green planet', sentence: 'I learned to type with My Green Keys and I will help save our beautiful green planet for all!', module: 'eco', targetWPM: 50 },
];

export const phases = [
  { id: 1, name: 'Home Row', icon: '🏠', lessons: 20, color: '#4CAF50', description: 'Master A S D F G H J K L keys first' },
  { id: 2, name: 'Top Row', icon: '⬆️', lessons: 25, color: '#2196F3', description: 'Add Q W E R T Y U I O P one by one' },
  { id: 3, name: 'Bottom Row', icon: '⬇️', lessons: 20, color: '#FF9800', description: 'Add Z X C V B N M and punctuation' },
  { id: 4, name: 'Numbers', icon: '🔢', lessons: 10, color: '#9C27B0', description: 'Learn all number keys with eco facts' },
  { id: 5, name: 'Capitals', icon: 'Aa', lessons: 15, color: '#E91E63', description: 'Shift key capitals and punctuation' },
  { id: 6, name: 'Speed', icon: '⚡', lessons: 15, color: '#FF5722', description: 'Full sentences paragraphs and speed drills' },
];