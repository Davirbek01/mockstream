"""
Generate LEVELED grammar topic tests using Gemini API.
Each test: 30 questions (10 B1 + 10 B2 + 10 C1/C2).
Run in batches:
  python generate_grammar_batch.py 1     # Batch 1 (topics 1-10)
  python generate_grammar_batch.py 2     # Batch 2 (topics 11-20)
  python generate_grammar_batch.py 3     # Batch 3 (topics 21-30)
  python generate_grammar_batch.py all   # All batches
"""

import json
import time
import re
import os
import sys
import google.generativeai as genai

API_KEY = "AIzaSyCfnYXgCySMlckKOdJw6vzRDlBVvJvZrZo"
genai.configure(api_key=API_KEY)
model = genai.GenerativeModel("gemini-2.5-flash")

# ─── NEW TOPICS (not yet existing in questions G/) ──────────────────────
ALL_TOPICS = [
    # ── Batch 1: Core Grammar Expansions ──
    {
        "file": "articles02",
        "title": "📰 Articles: Advanced Usage",
        "icon": "📰",
        "prompt_topic": "Articles (a/an/the/zero) in advanced contexts. B1: basic a/an/the with countable/uncountable nouns, fixed expressions (go to school, in hospital). B2: articles with abstract nouns (Love is blind vs The love I feel), geographical names (the Alps, Lake Baikal, the USA), newspaper headlines (no articles). C1/C2: articles in academic writing, with unique nouns (the sun, the president), idiomatic zero article (by bus, at night, in bed), subtle meaning changes (in prison vs in the prison, in school vs in the school, few vs a few, little vs a little)."
    },
    {
        "file": "conditionals02",
        "title": "🔀 Conditionals: Advanced Patterns",
        "icon": "🔀",
        "prompt_topic": "Advanced Conditional patterns beyond basic types. B1: zero and first conditional review, unless vs if not. B2: second conditional for unlikely/imaginary, third conditional for past regret, I wish / If only. C1/C2: mixed conditionals (If I had studied harder, I would be a doctor now / If she were braver, she would have spoken up), implied conditionals (Without your help, I would have failed = If it hadn't been for...), but for + noun (But for the rain, we would have gone), conditional with otherwise/or else, supposing/imagine/provided that."
    },
    {
        "file": "modal-verbs02",
        "title": "🔧 Modals: Nuance & Precision",
        "icon": "🔧",
        "prompt_topic": "Modal verbs — subtle distinctions and advanced uses. B1: can/could for ability and permission, must/have to for obligation, should for advice. B2: might vs may vs could for probability, needn't have vs didn't need to, should have / could have / would have for past criticism and regret. C1/C2: shall in legal/formal English, would for past habits vs used to, dare/need as semi-modals, 'will' for assumptions (That will be the postman), epistemic vs deontic modality, modal perfects for deduction (He must have left, She can't have known)."
    },
    {
        "file": "passive-voice02",
        "title": "🔄 Passive Voice: Complex Forms",
        "icon": "🔄",
        "prompt_topic": "Passive voice in complex and less common constructions. B1: basic passive (The cake was eaten), passive with by-agent, passive questions. B2: passive with two objects (I was given a book / A book was given to me), passive infinitive (She wants to be promoted), passive gerund (He hates being criticized). C1/C2: passive reporting structures (It is said that... / He is said to be...), have/get something done (causative passive), passive with phrasal verbs (The meeting was called off), impersonal passive (It is believed/thought/reported that), double passive (The building is expected to be completed)."
    },
    {
        "file": "relative-clauses02",
        "title": "🔗 Relative Clauses: Mastery",
        "icon": "🔗",
        "prompt_topic": "Relative clauses — complete mastery of all types. B1: who/which/that/where basics, defining vs non-defining with commas. B2: whose, whom, preposition + which (in which, for which), relative clauses with quantifiers (some of whom, most of which). C1/C2: reduced relative clauses (The man sitting there = who is sitting there), sentential relatives (He passed, which surprised everyone — 'which' refers to whole clause), relative clauses with 'what' (What I need is rest), cleft relatives (It was John who/that won), whereby/wherein in formal writing."
    },
    {
        "file": "reported-speech02",
        "title": "💬 Reported Speech: Advanced",
        "icon": "💬",
        "prompt_topic": "Advanced reported speech beyond basic backshift. B1: basic tense backshift (He said he was tired), say vs tell, reported yes/no questions. B2: reporting verbs + patterns (admit + -ing, promise + to, suggest + -ing / suggest that, warn someone + to/not to, deny + -ing, insist on + -ing). C1/C2: no backshift when still true (She said the Earth revolves around the Sun), subjunctive in reported speech (She demanded that he leave), reporting with 'as' (As the report states...), mixed reporting styles, reporting orders/advice/warnings, advanced reporting verbs: urge, beg, implore, advise, recommend, propose."
    },
    {
        "file": "prepositions02",
        "title": "📍 Prepositions: Tricky Contexts",
        "icon": "📍",
        "prompt_topic": "Prepositions in difficult and commonly confused contexts. B1: prepositions of time (in/on/at), place (in/on/at), movement (to/into/onto). B2: abstract prepositions (interested in, good at, afraid of, keen on, responsible for), prepositional phrases (in spite of, in terms of, by means of, on behalf of). C1/C2: prepositions after adjectives in less common collocations (indifferent to, contingent on, commensurate with, tantamount to, conducive to), prepositions in academic writing (with reference to, in accordance with, pursuant to), double prepositions (from behind, from under), preposition stranding vs fronting (Who did you speak to? vs To whom did you speak?)."
    },
    {
        "file": "tenses-present02",
        "title": "🕐 Present Tenses: Deep Dive",
        "icon": "🕐",
        "prompt_topic": "Present tenses — advanced uses and subtle distinctions. B1: present simple for facts/habits/schedules, present continuous for now/temporary. B2: present simple for future timetables (The train leaves at 6), present continuous for future plans (I'm meeting him tomorrow), state verbs that can be continuous with meaning change (I think = opinion vs I'm thinking = mental process, I have = possession vs I'm having = experience). C1/C2: historic present in narratives (So I walk in and she says...), present simple in conditionals and time clauses (When you see him, tell him), present perfect simple vs continuous nuance (I've read that book vs I've been reading that book), present tenses in news/sports commentary, performative verbs (I promise, I apologize, I declare)."
    },
    {
        "file": "tenses-past02",
        "title": "⏪ Past Tenses: Deep Dive",
        "icon": "⏪",
        "prompt_topic": "Past tenses — uncommon uses and precise distinctions. B1: past simple for finished actions, past continuous for background actions, past simple vs past continuous. B2: past perfect for the earlier of two past events, past perfect continuous for duration before a past event, used to vs past simple. C1/C2: past simple vs present perfect (nuance: She lived in London for 5 years — she doesn't now vs She has lived — she still does), past tenses in polite forms (I wondered if you could help, I was hoping you might), past tenses after wish/if only/it's time/would rather (It's time we left, I'd rather you didn't), past subjunctive (If I were...), past tenses in reported speech backshift."
    },
    {
        "file": "gerunds-infinitives02",
        "title": "📖 Gerunds & Infinitives: Mastery",
        "icon": "📖",
        "prompt_topic": "Gerunds and infinitives — advanced patterns and meaning changes. B1: verbs + gerund (enjoy, finish, avoid, suggest), verbs + infinitive (want, decide, hope, promise, agree). B2: verbs that change meaning (stop to do vs stop doing, remember to do vs remember doing, try to do vs try doing, forget to do vs forget doing, regret to say vs regret saying, go on to do vs go on doing). C1/C2: complex infinitive (to have done, to be doing, to have been doing), passive gerund/infinitive (being told, to be promoted), gerund as subject vs infinitive (Swimming is fun vs To err is human), adjective + infinitive (difficult to understand, the first to arrive, too tired to move), gerund after prepositions in formal writing, perfect gerund (Having finished..., He denied having stolen it)."
    },

    # ── Batch 2: Advanced & Specialized ──
    {
        "file": "phrasal-verbs02",
        "title": "🚀 Phrasal Verbs: Advanced",
        "icon": "🚀",
        "prompt_topic": "Advanced phrasal verbs — less common but important for higher levels. B1: common separable/inseparable phrasal verbs (turn off, look after, give up, put off, run into). B2: three-word phrasal verbs (look forward to, get along with, put up with, come up with, get rid of, run out of), formal equivalents (carry out = conduct, bring about = cause, set up = establish). C1/C2: less common phrasal verbs (iron out = resolve, phase out = gradually stop, fend off = defend against, hold forth = speak at length, mete out = distribute punishment, eke out = make last), phrasal verbs in business English (buy out, bail out, scale up, wind down), passivized phrasal verbs (The issue was ironed out), particle placement with long objects."
    },
    {
        "file": "word-formation02",
        "title": "🔤 Word Formation: Advanced",
        "icon": "🔤",
        "prompt_topic": "Advanced word formation — derivation, compounding, and conversion. B1: common prefixes (un-, re-, dis-, pre-, over-) and suffixes (-ness, -ment, -tion, -ly, -ful, -less). B2: negative prefixes (un-/in-/im-/il-/ir-/dis-/mis-/non-: unfair, incorrect, impossible, illegal, irregular, disagree, misunderstand, non-stop), adjective suffixes (-ous, -ive, -al, -ible/-able, -ic: dangerous, creative, musical, visible, economic vs economical). C1/C2: less common suffixes (-esque, -wards, -wise: picturesque, homewards, clockwise), compound adjectives (well-known, time-consuming, open-minded, far-reaching, thought-provoking), zero derivation / conversion (to email, to google, a run, a must), back-formation (edit from editor, babysit from babysitter), blends (brunch, smog, motel), clipping (exam, lab, fridge)."
    },
    {
        "file": "conjunctions02",
        "title": "⛓️ Conjunctions: Complex Linking",
        "icon": "⛓️",
        "prompt_topic": "Advanced conjunctions and linking mechanisms. B1: and/but/or/so/because, when/while/before/after. B2: although/even though/in spite of, provided that/as long as, in case, so that/in order to, not only...but also, whether...or. C1/C2: correlative conjunctions (both...and, either...or, neither...nor, no sooner...than, hardly...when, not only...but also with inversion: Not only did he pass...), subordinators (inasmuch as, insofar as, whereas, whilst, lest, notwithstanding), conjunctive adverbs (nevertheless, furthermore, consequently, accordingly, henceforth), rare coordinators (yet, for = because in formal style), punctuation with conjunctions (semicolon + however, comma before but)."
    },
    {
        "file": "subject-verb-agreement02",
        "title": "✅ Agreement: Tricky Cases",
        "icon": "✅",
        "prompt_topic": "Subject-verb agreement in difficult and unusual constructions. B1: basic singular/plural agreement, there is/are, compound subjects with and. B2: collective nouns (team is/are, government has/have), quantifiers (every/each + singular, both/several + plural, none of + singular or plural), subjects joined by or/nor (Neither he nor they were...). C1/C2: notional agreement vs grammatical agreement (The committee have decided — BrE), 'a number of' vs 'the number of', fractions/percentages (50% of the water is / 50% of the students are), what-clauses (What we need is/are answers), inverted subjects (Here comes the bus / Here come the buses), titles/names (The United States is), distances/amounts as singular (Ten miles is a long walk), relative clause agreement (One of the students who were / the only one of the students who was)."
    },
    {
        "file": "conditionals03",
        "title": "🔀 Conditionals: Formal & Rare",
        "icon": "🔀",
        "prompt_topic": "Rare and formal conditional structures. B1: review of Type 0/1 with time expressions (as soon as, until, while + present). B2: alternatives to if (unless, in case, provided/providing that, as/so long as, supposing, on condition that, assuming that). C1/C2: inverted conditionals without if (Had I known..., Were she here..., Should you require...), but for + past result (But for your help, I would have failed), 'were to' for formal/unlikely conditions (If the government were to collapse..., Were the company to merge...), conditional with otherwise/or else, implied conditionals (A good student would have checked = If they were a good student...), literary/archaic forms, conditional + subjunctive in demands (I demand that he be present, should he be absent)."
    },
    {
        "file": "emphasis-focus01",
        "title": "🎯 Emphasis & Focus Structures",
        "icon": "🎯",
        "prompt_topic": "Structures for emphasis and changing focus. B1: using 'very' and 'really' for emphasis, 'do' for emphasis (I do like it). B2: cleft sentences (It was John who broke the window), wh-clefts (What I need is rest, What she did was resign), fronting for emphasis (Never have I seen such a thing). C1/C2: reverse clefts (Rest is what I need), all-clefts (All I want is peace), negative inversion for emphasis (Not only did he arrive late, but..., Seldom have I witnessed..., Under no circumstances should you...), emphatic 'own' (my own car, on my own), reflexive pronouns for emphasis (I myself saw it, The president herself attended), 'the very' for emphasis (the very idea, the very thought), 'whatever/whoever' for emphasis (Whatever you do, don't panic)."
    },
    {
        "file": "academic-writing-grammar01",
        "title": "🎓 Academic Writing Grammar",
        "icon": "🎓",
        "prompt_topic": "Grammar structures essential for academic writing. B1: basic formal structures (It is important to..., There are several reasons...). B2: hedging language (It could be argued that..., This may suggest..., tends to, appears to), impersonal passive (It has been shown that..., It was found that...), nominal groups (the increase in / the effect of). C1/C2: complex noun phrases as subjects (The increasing number of students applying for...), anticipatory 'it' in academic prose (It is worth noting that..., It remains to be seen whether...), academic reporting verbs (The author contends/posits/asserts that...), complex preposition phrases (in light of, with regard to, in the context of, by virtue of), cautious language (somewhat, to a certain extent, relatively), nominalization for formality (We investigated → The investigation of...)."
    },
    {
        "file": "connectors-transitions01",
        "title": "🔗 Connectors & Transitions",
        "icon": "🔗",
        "prompt_topic": "Discourse connectors and transitional expressions for coherent writing/speaking. B1: basic connectors (firstly, then, finally, for example, however, because, so). B2: addition (furthermore, moreover, in addition, what's more), contrast (nevertheless, on the other hand, whereas, conversely), cause-result (consequently, as a result, therefore, thus, hence), exemplification (for instance, such as, namely). C1/C2: concession (notwithstanding, albeit, granted that, admittedly, be that as it may), reformulation (in other words, that is to say, to put it differently), summary (to sum up, in conclusion, all in all, on the whole), stance markers (arguably, presumably, evidently, understandably), rare/formal (henceforth, thereby, wherein, whereby, heretofore). Correct punctuation with each connector."
    },
    {
        "file": "error-correction01",
        "title": "🔍 Error Correction",
        "icon": "🔍",
        "prompt_topic": "Identifying and correcting grammatical errors in sentences. B1: basic errors — wrong tense (Yesterday I go → Yesterday I went), missing article (I am student → I am a student), wrong preposition (depend of → depend on), subject-verb agreement (He don't → He doesn't). B2: run-on sentences, dangling modifiers (Walking down the street, the trees were beautiful → ...I saw beautiful trees), comma splices, misplaced only, double negatives. C1/C2: subtle errors — bare infinitive vs to-infinitive after certain verbs, misnomers (less people → fewer people), whom vs who in formal contexts, subjunctive errors (I suggest he goes → I suggest he go), comma before 'which' in non-restrictive clauses, parallel structure violations, hanging comparatives (Older than me vs Older than I am), dangling ellipsis."
    },
    {
        "file": "determiners02",
        "title": "📐 Determiners: Advanced",
        "icon": "📐",
        "prompt_topic": "Advanced determiner usage including less common determiners. B1: this/that/these/those, some/any, much/many, a few/a little. B2: each vs every, all vs whole, another vs other vs the other, either vs neither, both vs all, no vs none. C1/C2: such (Such a day! vs Such people), 'what' as exclamatory determiner (What a mess!), 'whatever/whichever' as determiners (Whatever decision you make...), distributive determiners (each of the, every one of the), predeterminers (all the, both the, half the, double the, twice the), determiner stacking (all my three books), 'one' as determiner vs pronoun, 'enough' before/after noun (enough money vs time enough), absence of determiner in generic/mass contexts."
    },

    # ── Batch 3: Specialized & Test-Prep ──
    {
        "file": "verb-tense-contrast01",
        "title": "⏱️ Tense Contrast Pairs",
        "icon": "⏱️",
        "prompt_topic": "Practise choosing between commonly confused tense pairs. B1: present simple vs present continuous (I work vs I'm working), past simple vs past continuous (I walked vs I was walking), will vs going to. B2: present perfect vs past simple (I've lived here for 5 years vs I lived there for 5 years — nuance of current relevance), present perfect simple vs continuous (I've written 3 letters vs I've been writing letters), past simple vs past perfect (When I arrived, she left vs When I arrived, she had left). C1/C2: future perfect vs future continuous (By 6, I'll have finished vs At 6, I'll be working), past perfect vs past perfect continuous, would vs used to for past habits, mixed-time narratives requiring precise tense choice in connected paragraphs."
    },
    {
        "file": "noun-phrases-advanced01",
        "title": "🏗️ Advanced Noun Phrases",
        "icon": "🏗️",
        "prompt_topic": "Complex noun phrase structures for higher-level learners. B1: basic noun + adjective, noun + prepositional phrase (the book on the table). B2: noun + relative clause, noun + participle (the man standing there), noun + appositive (My brother, a doctor), compound nouns (bus stop, toothpaste, mother-in-law). C1/C2: pre-modification stacking (a large old red brick house — order of adjectives), post-modification chains (the proposal submitted by the committee for the annual review of...), nominalized clauses as noun phrases (The fact that he resigned surprised us all), appositional noun phrases in academic text, noun phrases with 'of' complements (the idea of leaving, the possibility of failure), extraposed noun phrases with 'it' (It surprised me, the sheer audacity of the plan)."
    },
    {
        "file": "expressing-opinions01",
        "title": "🗣️ Expressing Opinions & Certainty",
        "icon": "🗣️",
        "prompt_topic": "Grammar structures for expressing opinions, degrees of certainty, and agreement/disagreement. B1: I think/believe, In my opinion, I agree/disagree, maybe/probably/definitely. B2: It seems to me that..., As far as I'm concerned, On the whole, I'd say that, I tend to think, I partly agree. C1/C2: I'm inclined to believe..., It is my firm conviction that..., I would go so far as to say..., One might argue that..., It could be contended that..., I concede that... however..., The evidence would suggest..., I'm sceptical about the claim that..., There is a strong case for / against..., modality for tentativeness (may, might, could, would appear to), hedging vs boosting (somewhat vs clearly, It seems vs It is obvious)."
    },
    {
        "file": "comparison-structures01",
        "title": "📊 Comparison Structures",
        "icon": "📊",
        "prompt_topic": "All comparison constructions from basic to advanced. B1: comparative (-er/more) and superlative (-est/most), as...as, not as...as. B2: the more...the more (The harder you work, the more you learn), much/far/a lot + comparative (much better, far more expensive), less...than, the least, double comparatives (more and more expensive), like vs as. C1/C2: no sooner...than, scarcely...when, as if/as though + subjunctive (He talks as if he were the boss), comparative correlatives with inversion (The more I practice, the better I become), superlative + ever (the best I've ever seen), rather than / sooner than + bare infinitive, 'the' with comparatives (the sooner the better, the more the merrier), Latin comparatives (superior to, inferior to, prior to, senior to — NOT than)."
    },
    {
        "file": "sentence-types01",
        "title": "📝 Sentence Types & Structure",
        "icon": "📝",
        "prompt_topic": "Understanding and constructing different sentence types. B1: simple vs compound sentences (and, but, or, so), basic complex sentences (because, when, if, although). B2: compound-complex sentences, coordinating vs subordinating conjunctions, independent vs dependent clauses, run-on sentences and fragments. C1/C2: periodic sentences (placing main clause at end for effect — Although the weather was terrible, despite missing the bus, and even though she had a cold, she arrived on time), loose sentences (main clause first), balanced sentences (parallel structure), cumulative/additive sentences, rhetorical questions as sentence type, exclamatory constructions (What a + noun, How + adj), truncated sentences for effect, minor sentences (verbless: The more the merrier)."
    },
    {
        "file": "formal-register01",
        "title": "🎩 Formal Register Grammar",
        "icon": "🎩",
        "prompt_topic": "Grammar features that distinguish formal from informal register. B1: contractions in informal (don't, I'm) vs full forms in formal (do not, I am), please/could you for polite requests. B2: passive for formality (Mistakes were made vs We made mistakes), impersonal constructions (One must be careful), formal linking (therefore, consequently, namely vs so, that's why). C1/C2: subjunctive in formal demands (I insist that he be present, It is essential that she attend), fronting and inversion for formality (Enclosed is the report, Attached please find, Rarely does one encounter), formal question forms (To whom does this belong?), avoidance of phrasal verbs (investigate vs look into, postpone vs put off, tolerate vs put up with), shall in legal text, whom in formal relative clauses, subjunctive 'were' (If I were to suggest...)."
    },
    {
        "file": "clause-combination01",
        "title": "🔧 Clause Combination",
        "icon": "🔧",
        "prompt_topic": "Methods of combining clauses in English. B1: using and/but/or/because to join clauses, basic subordination with when/if/after. B2: using participle clauses (Having arrived early, she waited / Feeling tired, he sat down), using relative clauses to combine information, using 'with' + noun + participle (With the sun shining, we went for a walk). C1/C2: absolute participial constructions (The work finished, we went home = After the work was finished...), verbless clauses (Though exhausted, she continued = Though she was exhausted...), 'were' in parallel conditional clauses, complex nominalization to simplify clause structure (Their rejection of the proposal → They rejected the proposal), use of appositives to embed information, telescoped clauses, clausal substitution with 'so' and 'not' (I believe so, I hope not)."
    },
    {
        "file": "negation-advanced01",
        "title": "🚫 Negation: Advanced Patterns",
        "icon": "🚫",
        "prompt_topic": "Advanced negation including less common patterns. B1: basic not/don't/doesn't/didn't, no + noun (no time, no money), nothing/nobody/nowhere. B2: hardly/scarcely/barely as semi-negatives (I hardly know her, She barely passed), neither...nor, not...either, negative prefixes (unhappy, impossible, illegal). C1/C2: negative inversion (Never have I seen... Not only did she... At no time was the public informed... Under no circumstances should you... On no account may anyone...), transferred negation (I don't think he's coming = I think he isn't coming), double negation in formal style (not uncommon, not without merit), negative concord errors (I don't want nothing — WRONG), litotes (not bad = quite good, not unlikely = quite likely), barely/scarcely...when/before (Scarcely had I sat down when the phone rang)."
    },
    {
        "file": "it-there-constructions01",
        "title": "📦 It & There Constructions",
        "icon": "📦",
        "prompt_topic": "Expletive 'it' and 'there' in various constructions. B1: It + be + adjective + to infinitive (It is easy to learn), There + be + noun (There are three books). B2: It + take + time (It took me an hour), It + seem/appear + that (It seems that he left), There + modal + be (There must be a reason, There might be problems). C1/C2: It-cleft (It was Mary who called, It is in London that I was born), extraposed 'it' (It bothered me that she lied = That she lied bothered me), 'it' in passive reporting (It is thought/believed/said that...), existential 'there' with various verbs (There remains a problem, There arose a difficulty, There exists evidence, There seems to be), 'there' in formal vs informal (There appear to be vs It looks like there are), dummy 'it' for weather/time/distance (It's raining, It's 3 o'clock, It's a long way)."
    },
    {
        "file": "quantifiers02",
        "title": "🔢 Quantifiers: Precision",
        "icon": "🔢",
        "prompt_topic": "Precise use of quantifiers and quantity expressions. B1: some/any, much/many, a lot of, a few/a little, few/little. B2: several, a number of, a great deal of, plenty of, hardly any, the majority of, a minority of, the whole of. C1/C2: 'few' vs 'a few' vs 'quite a few' (subtle meaning shifts: negative vs positive vs surprisingly many), 'less' vs 'fewer' (less water vs fewer bottles — but 'less than 10 items' is accepted), amount of vs number of, each vs every vs all (Each student has... vs Every student has... vs All students have...), distributive each/every/all with singular/plural, 'no fewer than' / 'no less than', 'as many as' / 'as much as', the odd (the odd mistake = occasional), quantifiers with of (all of the / most of the / some of the — when 'of' is required vs optional)."
    }
]

PROMPT_TEMPLATE = """You are creating a LEVELED multiple-choice English grammar test in the style of englishtestsonline.com — MCQ grammar exercises.

Topic: {topic}

Generate EXACTLY 30 MCQ grammar questions as a JSON array, with THREE DIFFICULTY LEVELS:
- Questions 1-10: B1 level (Intermediate) — test basic understanding of the topic
- Questions 11-20: B2 level (Upper-Intermediate) — test more nuanced understanding
- Questions 21-30: C1/C2 level (Advanced/Proficiency) — test subtle distinctions and rare patterns

Use a MIX of these question types (distribute roughly equally across each level):
1. "Complete the sentence:" — A sentence with a blank (use ___ for the blank). The student picks the correct grammar form.
2. "Choose the correct option:" — A sentence where students must pick the grammatically correct word/phrase to fill a blank.
3. "Which is correct?" — Present a question like "Which sentence is grammatically correct?" and give 4 sentence options.

Each question must have these exact JSON fields:
- "type": one of the types above (string)
- "question": the question text — a sentence with ___ blank, or "Which sentence is grammatically correct?" (string, plain text only, NO HTML tags)
- "correct": the correct answer (string)
- "options": array of exactly 4 strings — the CORRECT answer MUST be the FIRST element, followed by 3 wrong options
- "def": a SHORT English explanation of the grammar rule being tested (string, max 15 words)
- "level": the CEFR level — "B1", "B2", or "C1" (string)

IMPORTANT RULES:
1. ALL 4 options must be plausible — wrong answers should be common grammar mistakes students actually make.
2. The correct answer MUST ALWAYS be the FIRST element in the "options" array.
3. B1 questions should be straightforward; B2 should require deeper knowledge; C1/C2 should challenge even near-native speakers.
4. "def" should briefly explain WHY the correct answer is right (the grammar rule), in English.
5. Sentences should be realistic, like from textbooks, newspapers, or everyday communication.
6. No duplicate questions. All 30 must be different.
7. For "Complete the sentence:" type, use ___ to show where the blank is.
8. Return ONLY a valid JSON array, no markdown, no explanation, no code fences.
9. Test a VARIETY of sub-rules within the topic — don't repeat the same grammar pattern.
10. Do NOT use any HTML tags like <u>, <b>, etc. Plain text only.
11. Questions 1-10 MUST have "level": "B1", questions 11-20 MUST have "level": "B2", questions 21-30 MUST have "level": "C1".

Example format:
[
  {{
    "type": "Complete the sentence:",
    "question": "If I ___ you, I would take that job offer.",
    "correct": "were",
    "options": ["were", "was", "am", "would be"],
    "def": "Second conditional uses 'were' for all subjects",
    "level": "B2"
  }},
  {{
    "type": "Choose the correct option:",
    "question": "By the time we arrived, the film ___.",
    "correct": "had already started",
    "options": ["had already started", "already started", "has already started", "was already starting"],
    "def": "Past perfect for action completed before another past action",
    "level": "B2"
  }},
  {{
    "type": "Which is correct?",
    "question": "Which sentence is grammatically correct?",
    "correct": "She suggested going to the cinema.",
    "options": ["She suggested going to the cinema.", "She suggested to go to the cinema.", "She suggested us to go to the cinema.", "She suggested that we should to go."],
    "def": "suggest + gerund OR suggest + (that) + subjunctive",
    "level": "C1"
  }}
]

Now generate exactly 30 questions for the topic described above (10 B1 + 10 B2 + 10 C1/C2). Return ONLY the JSON array."""


def clean_json_response(text):
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r'^```(?:json)?\s*\n?', '', text)
        text = re.sub(r'\n?```\s*$', '', text)
    return text.strip()


def validate_question(q):
    required = ("type", "question", "correct", "options", "def")
    if not all(k in q for k in required):
        return False
    if not isinstance(q["options"], list) or len(q["options"]) != 4:
        return False
    if q["correct"] != q["options"][0]:
        return False
    return True


def escape_js_string(s):
    if s is None:
        return ""
    return str(s).replace('\\', '\\\\').replace('"', '\\"').replace('\n', '\\n')


def generate_grammar_test(topic_info):
    prompt = PROMPT_TEMPLATE.format(topic=topic_info["prompt_topic"])

    max_retries = 3
    for attempt in range(max_retries):
        try:
            response = model.generate_content(prompt)
            raw = response.text
            cleaned = clean_json_response(raw)
            questions = json.loads(cleaned)

            if not isinstance(questions, list):
                print(f"  WARNING: Response is not a list, retrying...")
                continue

            valid = []
            for q in questions:
                if validate_question(q):
                    # Ensure level field exists
                    if "level" not in q:
                        idx = len(valid)
                        if idx < 10:
                            q["level"] = "B1"
                        elif idx < 20:
                            q["level"] = "B2"
                        else:
                            q["level"] = "C1"
                    valid.append(q)
                else:
                    print(f"  WARNING: Skipping invalid question: {str(q.get('question', '???'))[:60]}")

            if len(valid) < 25:
                print(f"  WARNING: Only {len(valid)} valid questions, retrying...")
                continue

            return valid[:30]

        except json.JSONDecodeError as e:
            print(f"  JSON parse error (attempt {attempt+1}): {e}")
            if attempt < max_retries - 1:
                time.sleep(5)
        except Exception as e:
            errmsg = str(e)
            print(f"  API error (attempt {attempt+1}): {errmsg[:200]}")
            if "429" in errmsg or "quota" in errmsg.lower():
                wait = 60 * (attempt + 1)
                print(f"  Rate limited, waiting {wait}s...")
                time.sleep(wait)
            elif attempt < max_retries - 1:
                time.sleep(5)

    return None


def write_grammar_test_js(topic_info, questions):
    filename = f"questions G/{topic_info['file']}.js"

    lines = []
    title_text = topic_info["title"].split(" ", 1)[-1] if " " in topic_info["title"] else topic_info["title"]
    lines.append(f'// Grammar Test: {title_text} (Leveled: B1→B2→C1)')
    lines.append(f'// Generated via Gemini API — 10 B1 + 10 B2 + 10 C1/C2')
    lines.append(f'// Total: {len(questions)} questions')
    lines.append('')
    lines.append('window.ALL_QUESTIONS = [')

    for i, q in enumerate(questions):
        comma = ',' if i < len(questions) - 1 else ''
        qtype = escape_js_string(q['type'])
        question = escape_js_string(q['question'])
        correct = escape_js_string(q['correct'])
        opts = ', '.join(f'"{escape_js_string(o)}"' for o in q['options'])
        defn = escape_js_string(q['def'])
        level = escape_js_string(q.get('level', 'B2'))

        lines.append(f'  {{type: "{qtype}", question: "{question}", correct: "{correct}", options: [{opts}], def: "{defn}", level: "{level}"}}{comma}')

    lines.append('];')
    lines.append('')

    filepath = os.path.join(os.path.dirname(os.path.abspath(__file__)), filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))

    return filename


def main():
    batch_arg = sys.argv[1] if len(sys.argv) > 1 else "all"

    batch_size = 10
    if batch_arg == "all":
        topics = ALL_TOPICS
        batch_label = "ALL"
    elif batch_arg.isdigit():
        batch_num = int(batch_arg)
        start = (batch_num - 1) * batch_size
        end = start + batch_size
        topics = ALL_TOPICS[start:end]
        batch_label = f"Batch {batch_num} (topics {start+1}-{min(end, len(ALL_TOPICS))})"
    else:
        print(f"Usage: python generate_grammar_batch.py [1|2|3|all]")
        return

    if not topics:
        print(f"No topics in {batch_label}")
        return

    print(f"\n{'='*60}")
    print(f"  Grammar Test Generator — {batch_label}")
    print(f"  Topics: {len(topics)}")
    print(f"  Format: 30 questions per topic (10 B1 + 10 B2 + 10 C1/C2)")
    print(f"{'='*60}\n")

    generated = []
    failed = []

    for i, topic in enumerate(topics):
        # Skip if already generated
        outpath = os.path.join(os.path.dirname(os.path.abspath(__file__)), f"questions G/{topic['file']}.js")
        if os.path.exists(outpath):
            print(f"[{i+1}/{len(topics)}] SKIP (exists): {topic['title']}")
            generated.append(topic)
            continue

        print(f"[{i+1}/{len(topics)}] Generating: {topic['title']}...")

        questions = generate_grammar_test(topic)

        if questions:
            filename = write_grammar_test_js(topic, questions)
            b1 = sum(1 for q in questions if q.get('level') == 'B1')
            b2 = sum(1 for q in questions if q.get('level') == 'B2')
            c1 = sum(1 for q in questions if q.get('level') in ('C1', 'C2'))
            print(f"  ✓ Saved {len(questions)} questions to {filename} (B1:{b1} B2:{b2} C1:{c1})")
            generated.append(topic)
        else:
            print(f"  ✗ FAILED to generate questions for {topic['title']}")
            failed.append(topic)

        # Rate limiting
        if i < len(topics) - 1:
            time.sleep(4)

    print(f"\n{'='*60}")
    print(f"DONE: {len(generated)} generated, {len(failed)} failed")

    if generated:
        print(f"\nAdd these to grammarTests in landing.html:")
        for t in generated:
            name = t['title'].split(' ', 1)[-1] if ' ' in t['title'] else t['title']
            print(f"      {{ file: 'test.html?test={t['file']}&type=grammar', name: '{name}', icon: '{t['icon']}' }},")

    if failed:
        print(f"\nFAILED topics (re-run the batch to retry):")
        for t in failed:
            print(f"  - {t['title']}")


if __name__ == "__main__":
    main()
