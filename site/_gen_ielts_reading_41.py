import json
import os
import re
import subprocess
import tempfile

API_KEY = "AIzaSyC61g88nXtTAlY53GVKl4HE-gjzAvz1T-o"
URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={API_KEY}"


def call_gemini(prompt, temperature=0.35, max_tokens=8192):
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": temperature,
            "maxOutputTokens": max_tokens,
            "responseMimeType": "application/json"
        }
    }
    payload_json = json.dumps(payload, ensure_ascii=False)
    last_err = None
    for _ in range(3):
        tmp_path = None
        try:
            with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False, encoding="utf-8") as tf:
                tf.write(payload_json)
                tmp_path = tf.name

            result = subprocess.run(
                [
                    "curl.exe", "-s", "--max-time", "180", "-X", "POST",
                    "-H", "Content-Type: application/json",
                    "-d", "@" + tmp_path,
                    URL,
                ],
                capture_output=True,
                text=True,
                encoding="utf-8",
                timeout=200,
            )

            if not result.stdout.strip():
                raise RuntimeError("Empty Gemini response")

            data = json.loads(result.stdout)
            return data["candidates"][0]["content"]["parts"][0]["text"]
        except Exception as e:
            last_err = e
        finally:
            if tmp_path and os.path.exists(tmp_path):
                os.unlink(tmp_path)

    raise RuntimeError(f"Gemini failed after retries: {last_err}")


def parse_json_obj(text):
    text = text.strip()
    try:
        return json.loads(text)
    except Exception:
        m = re.search(r"\{[\s\S]*\}", text)
        if not m:
            raise
        return json.loads(m.group(0))


def strip_html(s):
    return re.sub(r"<[^>]+>", "", s or "")


def build_prompt(passage_title, passage_text, questions, answers):
    q_lines = []
    for q in questions:
        qid = q["id"]
        base = f"Q{qid}: {strip_html(q['text'])}"
        if "options" in q and q["options"]:
            base += "\nOptions: " + " | ".join(q["options"])
        base += f"\nCorrect answer(s): {', '.join(answers.get(f'q{qid}', []))}"
        q_lines.append(base)

    return f"""
Generate IELTS Reading explanations.

Return ONLY a valid JSON object:
{{
  "q1": {{"text": "...", "quote": "..."}},
  "q2": {{"text": "...", "quote": "..."}}
}}

Rules:
- Write concise learner-friendly explanations (1-3 sentences each).
- Keep factual and aligned to the provided correct answers.
- For NOT GIVEN, set quote to empty string.
- For matching/list/mcq, explain selection logic briefly.
- Use exact passage wording for quote where possible.

Passage title: {passage_title}
Passage text:
{strip_html(passage_text)}

Questions and answers:
{chr(10).join(q_lines)}
""".strip()


passage1_text = """<h3>Dolls Through the Ages</h3>

<p><strong>A</strong> What is today a simple children's toy has a surprisingly rich history. Dolls have been a part of humankind for thousands of years. Often depicting religious figures, or used as playthings, early dolls were probably made from primitive materials such as clay, fur, or wood.</p>

<p><strong>B</strong> Dolls constructed of flat pieces of wood, painted with various designs, and with 'hair' made of clay, have often been found in Egyptian graves dating back to 2000 BC. Egyptian tombs of wealthy families have included pottery dolls. Dolls being placed in these graves leads some to believe that they were cherished possessions.</p>

<p><strong>C</strong> Girls from ancient Greece and Rome offered their wooden dolls to goddesses after they were too 'grown-up' to play with dolls. Most ancient dolls that were found in tombs were very simple creations, often made from such materials as clay, rags, wood, or bone. Some of the more unique dolls were made with ivory or wax. The main goal was to make the doll as lifelike as possible. That ideal led to the creation of dolls with movable limbs and removeable garments, dating back to 600 BC.</p>

<p><strong>D</strong> Following the era of the ancient dolls, Europe became a major hub for doll production. These dolls were primarily made of wood. Fewer than 30 examples of primitive wooden stump dolls from England survive today. The Grodental area of Germany produced many peg wooden dolls, a type of doll that has very simple peg joints and resembles a clothespin (a device for hanging washing on a clothesline). An alternative to wood was needed in the 1800s.</p>

<p><strong>E</strong> Composition' is a collective term for mixtures of pulped wood or paper that were used to make doll heads and bodies. These mixtures were moulded under pressure, creating a durable doll that could be mass-produced. Manufacturers closely guarded the recipes for their mixtures, sometimes using strange ingredients like ash or eggshells. Papier-mache, a type of composition, was one of the most popular mixtures.</p>

<p><strong>F</strong> In addition to wooden dolls, wax dolls grew in popularity in the 17th and 18th centuries. Mould in Germany was a major role in creating center for wax dolls. Wax dollmakers would model a doll's head in wax or clay, and then cover it with plaster to create a mould. Then they would pour melted wax into the cast. The wax for the head would be very thin, no more than 3 mm. Some of the most distinctive wax dolls were created in England between 1850 and 1930. One of the first dolls that portrayed a baby was made in England from wax at the beginning of the 19th century.</p>

<p><strong>G</strong> Around the same time, porcelain became popular. It is made by firing special clays in a kiln at more than 2,372 degrees Fahrenheit (1300°C), and only a few clays can withstand firing at such high temperatures. Porcelain is used generically to refer to both china and bisque dolls; china is glazed, whereas bisque is unglazed. Germany, France, and Denmark started creating china heads for dolls in the 1840s. These china heads were replaced in the 1860s by ones made of bisque. Bisque, which is porcelain fired twice with colour added to it after the first firing, looked more like skin than china did.</p>

<p><strong>H</strong> In France, the bebe was popular in the 1880s, and it has become a highly sought-after doll today. The bebe, first made in the 1850s, was different from its predecessors because it depicted a younger girl. Until then, most French dolls were representations of adults. Although the French dolls were unrivalled in their artistry, German bisque dolls became quite popular because they were not as expensive. Kammer & Reinhardt introduced a bisque character doll in the 1900s, starting a trend of creating realistic dolls.</p>

<p><strong>I</strong> For many centuries, rag dolls were made by mothers for their children. The term 'rag doll' refers generically to dolls made of any fabric. 'Cloth doll' refers to a subset of rag dolls made of linen or cotton. Commercially produced rag dolls were first introduced in the 1850s by English and American manufacturers. Although not as sophisticated as dolls made from other materials, rag dolls were well loved, often as a child's first toy.</p>

<p><strong>J</strong> Dollmaking did not become an industry in the United States until after the Civil War in the 1860s. Doll production was concentrated in the New England region of the United States, with dolls made from a variety of materials such as leather, rubber, papier-mache, and cloth. Celluloid was developed in the state of New Jersey in the late 1860s and was used to manufacture dolls until the mid-1950s. German, French, American, and Japanese factories churned out cheaply produced celluloid dolls in mass quantities. However, celluloid fell out of favour because of its extreme flammability and propensity to fade in bright light.</p>

<p><strong>K</strong> After World War I, dollmakers experimented with plastics. Hard plastic dolls were manufactured in the 1940s. They resembled composition dolls, but they were much more durable. Other materials used in doll manufacturing included rubber, foam rubber, and vinyl in the 1950s and 1960s. Vinyl changed dollmaking, allowing dollmakers to root hair into the head, rather than using wigs or painting the hair. Although most dolls are now mass-manufactured using these modern materials, many modern dollmakers are still using the traditional materials of the past to make collectible dolls.</p>"""

passage2_text = """<h3>The power of music</h3>

<p><strong>A</strong> Music is becoming ever more popular electronically. To meet our craving for music, internet sites are using increasingly sophisticated ways of putting us in touch with artists we may not even know we like. Most work by trawling our existing files or online listening habits and looking for patterns so they can recommend new artists for their subscribers to listen to. The search often turns up surprises. But is it possible to tease apart our likes and dislikes to identify precisely what it is about some music that thrills us or leaves us cold?</p>

<p><strong>B</strong> For centuries composers have sought to create unforgettable music using accepted notions about the emotional appeal of certain combinations of sounds, yet only now are scientists starting to uncover what it is about these combinations that can have such a dramatic effect on our minds. Given that archaeologists have found musical instruments played by Neanderthals at least 50,000 years ago, why have scientists taken so long to investigate such a source of pleasure?</p>

<p><strong>C</strong> "For psychologists, who are always desperate to show that their work is rigorous, there's an image problem in tackling the emotionality of music," says Professor Norman Cook of Kansai University in Osaka, Japan, one of the pioneers of the new science of music. Emotion is such a slippery topic." The other problem, says Cook, is the long-standing principle among psychologists that our response to music is an acquired one, rather than something that is stimulated by the effect of sound on our brain cells. Yet one of the first insights to emerge from this new branch of psychology is that music affects our brains at a very basic level.</p>

<p><strong>D</strong> Together with his colleague, Professor Takefumi Hayashi, Cook has been investigating one of the best-known examples of the emotional impact of music: the difference between major and minor chords. For centuries, composers have known that notes arranged to form major chords sound happy and upbeat, while those in minor chords sound mournful. In tests, even three-year-olds have been shown to link music in a major mode to happy faces and minor modes to sad faces.</p>

<p><strong>E</strong> According to Cook, analysis of how people respond to notes suggests a link with how our brains interpret certain sounds in everyday life. He points out that sad-sounding minor chords can be formed by raising the pitch of any of a set of notes, while dropping the pitch produces a major chord. The same change in pitch works as an emotional telltale in communication between some mammals, where rising pitch is used to communicate weakness or defeat, while falling pitch signals social dominance. It's also present in our speech. "A rising inflection is used to denote questions, politeness or deference, whereas a falling inflection signals dominance," says Cook.</p>

<p><strong>F</strong> This suggests that music in major and minor modes taps into some very basic features of how we relate to the world and each other - perhaps dating back millions of years. Could music in general be doing something similar? Quite possibly, according to research into how music triggers certain types of brain activity. At McGill University in Canada, Professor Robert Zatorre and his colleagues have carried out studies in which volunteers listen to different types of music while their brain activity is monitored. The biggest surprise was the evidence that pleasurable music activates brain circuitry which has been in existence in the human brain for thousands of years says Zatorre. We share it with rats and other distant relatives on the evolutionary tree - and it's typically associated with biological rewards, like food, for example.</p>

<p><strong>G</strong> At the University of Oxford, Dr Joyce Chen has been looking into another celebrated feature of music - the irresistibility of rhythm. Her interest was sparked by studies involving patients with movement difficulties. If music that had a strong rhythm, say a marching band - was played to these patients, they were able to improve their walking ability, says Chen. In an attempt to find out why the simple act of listening to music might help disabled patients, Dr Chen and colleagues from the International Laboratory for Brain, Music and Sound Research in Montreal carried out brain scans on volunteers who were listening to rhythmic sounds. The criteria for selecting these volunteers were that they should be in first-rate physical health but musically untrained. The results have been another revelation. Chen and her colleagues found the rhythms triggered activity in parts of the brain linked to hearing, but something even more surprising was that the rhythms also triggered activity in the motor regions of the brain, linked to active movement.</p>

<p><strong>H</strong> "Somehow, the mere act of just listening triggers motor-neural activity. Maybe this is one reason why we often tap our feet, move our dancing or dance hearing music," says Chen. She believes the discovery of this deep connection between music and movement may cast light on why disabled patients can benefit from listening to music and could also prove useful with other impairments such as those involved in sound production. "It's been shown that people who talk with a stutter might have problems in this auditory-motor loop."</p>

<p><strong>I</strong> For researchers working in this new area of science, these early discoveries hold the promise of much more to come. Zatorre and his colleagues are investigating whether some people have more musical brains than others. We can see certain subtle brain features that can tell us how well somebody can do things like identify a slight change in a melody, explains Zatorre. "This ability could be enhanced by training - just like someone born with a predisposition to building strong muscles can enhance them by taking up weightlifting."</p>"""

passage3_text = """<h3>Yawning</h3>

<p><strong>A</strong> How and why we yawn still presents problems for researchers in an area which has only recently been opened up to study. When Robert R. Provine began studying yawning in the 1960s, it was difficult for him to convince research students of the merits of 'yawning science'. Although it may appear quirky to some, Provine's decision to study yawning was a logical extension of his research in developmental neuroscience.</p>

<p><strong>B</strong> The verb 'to yawn' is derived from the Old English gänian or ginian, meaning to gape or open wide. But in addition to gaping jaws, yawning has significant features that are easy to observe and analyze. Provine collected' yawns to study by using a variation of the contagion response. He asked people to 'think about yawning' and, once they began to yawn, to depress a button and record the duration of the yawn to the exhalation at its end.</p>

<p><strong>C</strong> Provine's early discoveries can be summarized as follows: a yawn is highly stereotyped but not invariant in its duration and form. It is an excellent example of the instinctive 'fixed action pattern' of classical animal-behavior study, or ethology. It is not a reflex (a short-duration, rapid proportional response to a simple stimulus), but, once started, a yawn progresses with the inevitability of a sneeze. The standard yawn runs its course over about six seconds on average, but its duration can range from about three seconds to much longer than the average. There are no half-yawns: this is an example of the typical intensity of fixed action patterns and a reason why you cannot stifle yawns. Just like a cough, yawns can come in bouts with a highly variable inter-yawn interval, which is generally about 68 seconds but rarely more than 70. There is no relation between yawn frequency and duration; producers of short or long yawns do not compensate by yawning more or less often. Furthermore, Provine's hypotheses about the form and function of yawning can be tested by three informative yawn variants that can be used to look at the roles of the nose, the mouth, and the jaws.</p>

<p><strong>D</strong> i) <strong>The closed nose yawn</strong><br>Subjects are asked to pinch their nose closed when they feel themselves start to yawn. Most subjects report being able to perform nearly normal closed nose yawns. This indicates that the inhalation at the onset of a yawn, and the exhalation at its end, do not involve the nostrils - the mouth provides a sufficient airway.</p>

<p>ii) <strong>The clenched teeth yawn</strong><br>Subjects are asked to clench their teeth when they feel themselves start to yawn but allow themselves to inhale normally through their open lips and clenched teeth. This variation gives one the sensation of being stuck mid-yawn. This shows that gaping of the jaws is an essential component of the fixed pattern of the yawn, and unless it is accomplished, the program (or pattern) will not run to completion. The yawn is also shown to be more than a deep breath, because, unlike normal breathing, inhalation and exhalation cannot be performed as well through the clenched teeth as through the nose.</p>

<p>iii) <strong>The nose yawn</strong><br>This variant tests the adequacy of the nasal airway to sustain a yawn. Unlike normal breathing, which can be performed equally well through mouth or nose, yawning is impossible via nasal inhalation alone. As with the clenched teeth yawn, the nose yawn provides the unfulfilling sensation of being stuck mid-yawn. Exhalation, on the other hand, can be accomplished equally well through nose or mouth. Through this methodology, Provine demonstrated that inhalation through the oral airway and the gaping of jaws are necessary for normal yawns. The motor program for yawning will not run to completion without feedback that these parts of the program have been accomplished.</p>

<p><strong>E</strong> But yawning is a powerful, generalized movement that involves much more than airway maneuvers and jaw-gaping. When yawning, you also stretch your facial muscles, tilt your head back, narrow or close your eyes, produce tears, salivate, open the Eustachian tubes of your middle ear, and perform many other, yet unspecified, cardiovascular and respiratory acts. Perhaps the yawn shares components with other behavior. For example, is the yawn a kind of slow sneeze or is the sneeze a fast yawn? Both share common respiratory and other features including jaw gaping, eye closing, and head tilting.</p>

<p><strong>F</strong> Yawning and stretching share properties and may be performed together as parts of a global motor complex. Studies by JJP de Vries et al. in the early 1980s, charting movement in the developing fetus using ultrasound, observed a link between yawning and stretching. The most extraordinary demonstration of the yawn-stretch linkage occurs in many people paralyzed on one side of their body because of brain damage caused by a stroke. The prominent British neurologist Sir Francis Walshe noted in 1923 that when these people yawn, they are startled and mystified to observe that their otherwise paralyzed arm rises and flexes automatically in what neurologists term an 'associated response'. Yawning apparently activates undamaged, unconsciously controlled connections between the brain and the motor system, causing the paralyzed limb to move. It is not known whether the associated response is a positive prognosis for recovery, nor whether yawning is therapeutic for prevention of muscular deterioration.</p>

<p><strong>G</strong> Provine speculated that, in general, yawning may have many functions, and selecting a single function from the available options may be an unrealistic goal. Yawning appears to be associated with a change of behavioral state, switching from one activity to another. Yawning is also a reminder that ancient and unconscious behavior linking us to the animal world lurks beneath the veneer of culture, rationality, and language.</p>"""


p1_sections = [
    {
        "type": "completion",
        "typeName": "Note Completion",
        "title": "Questions 1-6",
        "instruction": "Questions 1-6\n\nComplete the notes below.\n\nWrite ONE WORD ONLY from the passage for each answer.",
        "headingsList": [],
        "featuresList": [],
        "questions": [
            {"id": 1, "text": "<strong>Dolls</strong><br><strong>Earliest known dolls</strong><br>represented religious figures<br>used as toys<br><strong>Egypt, 2000 BC</strong><br>bodies were made of wood<br>{INPUT} was used for the hair"},
            {"id": 2, "text": "<strong>Ancient Greece and Rome</strong><br>dolls were given to {INPUT} by older girls"},
            {"id": 3, "text": "<strong>600 BC</strong><br>realistic dolls had separate clothes and {INPUT} that could be put in different positions"},
            {"id": 4, "text": "<strong>17th and 18th centuries</strong><br>dolls made of {INPUT} became more common"},
            {"id": 5, "text": "moulds made of {INPUT}"},
            {"id": 6, "text": "<strong>1800s</strong><br>new manufacturing process developed<br>new group of mixtures known as {INPUT}<br>recipes for these mixtures kept secret"},
        ],
    },
    {
        "type": "tfng",
        "typeName": "True/False/Not Given",
        "title": "Questions 7-13",
        "instruction": "Questions 7-13\n\nDo the following statements agree with the information given in Reading Passage 1?\n\nIn boxes 7-13 on your answer sheet, write\n\n<strong>TRUE</strong> if the statement agrees with the information\n<strong>FALSE</strong> if the statement contradicts the information\n<strong>NOT GIVEN</strong> if there is no information on this",
        "headingsList": [],
        "featuresList": [],
        "questions": [
            {"id": 7, "text": "Bisque dolls appear less realistic than dolls made of china."},
            {"id": 8, "text": "French dolls tended to cost more than German bisque dolls."},
            {"id": 9, "text": "The first rag dolls were made in the 1850s."},
            {"id": 10, "text": "Only dolls made of cotton or linen are classified as cloth dolls."},
            {"id": 11, "text": "Dolls made of celluloid tended to lose their colour."},
            {"id": 12, "text": "Composition dolls lasted longer than the plastic dolls that were made in the 1940s."},
            {"id": 13, "text": "Doll collectors prefer a doll to be dressed in its original clothing."},
        ],
    },
]

p2_sections = [
    {
        "type": "matching-info",
        "typeName": "Matching Information",
        "title": "Questions 14-18",
        "instruction": "Questions 14-18<br><br>Reading Passage 2 has nine paragraphs, <strong>A-I</strong>.<br><br>Which paragraph contains the following information?<br><br>Write the correct letter, <strong>A-I</strong>, in boxes 14-18 on your answer sheet.",
        "headingsList": [],
        "featuresList": ["A", "B", "C", "D", "E", "F", "G", "H", "I"],
        "questions": [
            {"id": 14, "text": "a reference to studies involving children"},
            {"id": 15, "text": "a mention of the discovery of significant artefacts"},
            {"id": 16, "text": "reasons why a particular aspect of music has not been researched"},
            {"id": 17, "text": "a mention of an unexpected discovery involving two different areas of the brain"},
            {"id": 18, "text": "a comparison of tone variations produced by certain animals and humans"},
        ],
    },
    {
        "type": "completion",
        "typeName": "Summary Completion",
        "title": "Questions 19-22",
        "instruction": "Questions 19-22<br><br>Complete the summary below.<br><br>Choose <strong>NO MORE THAN TWO WORDS</strong> from the passage for each answer.<br><br>Write your answers in boxes 19-22 on your answer sheet.",
        "headingsList": [],
        "featuresList": [],
        "questions": [
            {"id": 19, "text": "<strong>A study involving collaboration between researchers in Oxford and Montreal</strong><br>The participants in this study led by Dr Chen were chosen because they were not musicians, and they demonstrated a good state of {INPUT}."},
            {"id": 20, "text": "The participants were given {INPUT}, while music with a very noticeable rhythm was being played."},
            {"id": 21, "text": "Previous research had indicated that listening to this type of music seemed to be of assistance to some {INPUT} people."},
            {"id": 22, "text": "By listening to it, their {INPUT} ability had definitely got better. The findings of Dr Chen's study proved most informative."},
        ],
    },
    {
        "type": "matching-features",
        "typeName": "Matching Features",
        "title": "Questions 23-26",
        "instruction": "Questions 23-26<br><br>Look at the following statements (Questions 23-26) and the list of researchers below.<br><br>Match each statement with the correct researcher, <strong>A, B or C</strong>.<br><br>Write the correct letter, <strong>A, B or C</strong>, in boxes 23-26 on your answer sheet.<br><br><strong>NB</strong> <em>You may use any letter more than once.</em>",
        "boxTitle": "List of Researchers",
        "headingsList": [],
        "featuresList": [
            "A Professor Norman Cook",
            "B Professor Robert Zatorre",
            "C Dr Joyce Chen",
        ],
        "questions": [
            {"id": 23, "text": "Research into the brain activity set off by music may help people with speech defects."},
            {"id": 24, "text": "It may be possible in time to improve a person's ability to recognise certain musical characteristics."},
            {"id": 25, "text": "The way listeners react to certain musical combinations may be similar to the way they react to other noises."},
            {"id": 26, "text": "When a person reacts positively to music, the same parts of the brain are stimulated as when certain animals react to a positive outcome."},
        ],
    },
]

p3_sections = [
    {
        "type": "list-selection",
        "typeName": "Summary Completion (List)",
        "title": "Questions 27-32",
        "instruction": "Questions 27-32<br><br>Complete the summary using the list of words, <strong>A-K</strong>, below.<br><br>Write the correct letter, <strong>A-K</strong>, in boxes 27-32 on your answer sheet.",
        "boxTitle": "Provine's early findings on yawns",
        "headingsList": [],
        "featuresList": [
            "A form and function",
            "B long yawns",
            "C 3 seconds",
            "D fixed action pattern",
            "E 68 seconds",
            "F short yawns",
            "G reflex",
            "H sneeze",
            "I short duration",
            "J 6 seconds",
            "K half-yawns",
        ],
        "questions": [
            {"id": 27, "text": "Through his observations of yawns, Provine was able to confirm that {INPUT} do not exist."},
            {"id": 28, "text": "Just like a {INPUT}, yawns cannot be interrupted after they have begun."},
            {"id": 29, "text": "This is because yawns occur as a {INPUT} rather than a stimulus response as was previously thought."},
            {"id": 30, "text": "In measuring the time taken to yawn, Provine found that a typical yawn lasts about {INPUT}."},
            {"id": 31, "text": "He also found that it is common for people to yawn a number of times in quick succession with the yawns usually being around {INPUT} apart."},
            {"id": 32, "text": "When studying whether length and rate were connected, Provine concluded that {INPUT} do not necessarily produce more yawns to make up for this."},
        ],
    },
    {
        "type": "mcq",
        "typeName": "Multiple Choice",
        "title": "Questions 33-37",
        "instruction": "Questions 33-37<br><br>Choose the correct letter <strong>A, B, C, D</strong>.<br><br>Write the correct letter in boxes 33-37 on your answer sheet.",
        "headingsList": [],
        "featuresList": [],
        "questions": [
            {
                "id": 33,
                "text": "What did Provine conclude from his closed nose yawn experiment?",
                "options": [
                    "Ending a yawn requires use of the nostrils",
                    "You can yawn without breathing through your nose",
                    "Breathing through the nose produces a silent yawn",
                    "The role of the nose in yawning needs further investigation",
                ],
            },
            {
                "id": 34,
                "text": "Provine's clenched teeth yawn experiment shows that:",
                "options": [
                    "yawning is unconnected with fatigue",
                    "a yawn is the equivalent of a deep intake of breath",
                    "you have to be able to open your mouth wide to yawn",
                    "breathing with the teeth together is as efficient as through the nose",
                ],
            },
            {
                "id": 35,
                "text": "The nose yawn experiment was used to test whether yawning:",
                "options": [
                    "can be stopped after it has started",
                    "is the result of motor programming",
                    "involves both inhalation and exhalation",
                    "can be accomplished only through the nose",
                ],
            },
            {
                "id": 36,
                "text": "In people paralysed on one side because of brain damage:",
                "options": [
                    "yawning may involve only one side of the face",
                    "the yawning response indicates that recovery is likely",
                    "movement in the paralysed arm is stimulated by yawning",
                    "yawning can be used as an exercise to prevent muscle wasting",
                ],
            },
            {
                "id": 37,
                "text": "In the last paragraph, the writer concludes that:",
                "options": [
                    "yawning is a sign of boredom",
                    "we yawn in spite of the development of our species",
                    "yawning is a more passive activity than we imagine",
                    "we are stimulated to yawn when our brain activity is low",
                ],
            },
        ],
    },
    {
        "type": "ynng",
        "typeName": "Yes/No/Not Given",
        "title": "Questions 38-40",
        "instruction": "Questions 38-40<br><br>Do the following statements agree with the claims of the writer in Reading Passage 3?<br><br>In boxes 38-40 on your answer sheet, write:<br><br><strong>YES</strong> - The statement agrees with the claims of the writer<br><strong>NO</strong> - The statement contradicts the claims of the writer<br><strong>NOT GIVEN</strong> - It is impossible to say what the writer thinks about this",
        "headingsList": [],
        "featuresList": [],
        "questions": [
            {"id": 38, "text": "Research students were initially reluctant to appreciate the value of Provine's studies"},
            {"id": 39, "text": "When foetuses yawn and stretch they are learning how to control movement."},
            {"id": 40, "text": "According to Provine, referring to only one function is probably inadequate to explain why people yawn."},
        ],
    },
]


correct_answers = {
    "q1": ["clay"],
    "q2": ["goddesses"],
    "q3": ["limbs"],
    "q4": ["wax"],
    "q5": ["plaster"],
    "q6": ["composition"],
    "q7": ["FALSE"],
    "q8": ["TRUE"],
    "q9": ["FALSE"],
    "q10": ["TRUE"],
    "q11": ["TRUE"],
    "q12": ["FALSE"],
    "q13": ["NOT GIVEN"],
    "q14": ["D"],
    "q15": ["B"],
    "q16": ["C"],
    "q17": ["G"],
    "q18": ["E"],
    "q19": ["physical health"],
    "q20": ["brain scans"],
    "q21": ["disabled"],
    "q22": ["walking"],
    "q23": ["C"],
    "q24": ["B"],
    "q25": ["A"],
    "q26": ["B"],
    "q27": ["K"],
    "q28": ["H"],
    "q29": ["D"],
    "q30": ["J"],
    "q31": ["E"],
    "q32": ["F"],
    "q33": ["B"],
    "q34": ["C"],
    "q35": ["D"],
    "q36": ["C"],
    "q37": ["B"],
    "q38": ["YES"],
    "q39": ["NOT GIVEN"],
    "q40": ["YES"],
}


passages = [
    {
        "id": 1,
        "title": "Dolls Through the Ages",
        "shortName": "Dolls",
        "difficulty": "Easy",
        "questionRange": "1-13",
        "timeRecommended": 20,
        "passageHeader": {
            "title": "READING PASSAGE 1",
            "instruction": "You should spend about 20 minutes on <strong>Questions 1-13</strong>, which are based on Reading Passage 1 below.",
        },
        "passage": passage1_text,
        "questionSections": p1_sections,
        "correctAnswers": {k: v for k, v in correct_answers.items() if 1 <= int(k[1:]) <= 13},
        "explanations": {},
    },
    {
        "id": 2,
        "title": "The power of music",
        "shortName": "Power of Music",
        "difficulty": "Medium",
        "questionRange": "14-26",
        "timeRecommended": 20,
        "passageHeader": {
            "title": "READING PASSAGE 2",
            "instruction": "You should spend about 20 minutes on <strong>Questions 14-26</strong>, which are based on Reading Passage 2 below.",
        },
        "passage": passage2_text,
        "questionSections": p2_sections,
        "correctAnswers": {k: v for k, v in correct_answers.items() if 14 <= int(k[1:]) <= 26},
        "explanations": {},
    },
    {
        "id": 3,
        "title": "Yawning",
        "shortName": "Yawning",
        "difficulty": "Hard",
        "questionRange": "27-40",
        "timeRecommended": 20,
        "passageHeader": {
            "title": "READING PASSAGE 3",
            "instruction": "You should spend about 20 minutes on <strong>Questions 27-40</strong>, which are based on Reading Passage 3 below.",
        },
        "passage": passage3_text,
        "questionSections": p3_sections,
        "correctAnswers": {k: v for k, v in correct_answers.items() if 27 <= int(k[1:]) <= 40},
        "explanations": {},
    },
]


print("Generating explanations with Gemini...")
for p in passages:
    all_q = []
    for sec in p["questionSections"]:
        all_q.extend(sec.get("questions", []))

    prompt = build_prompt(p["title"], p["passage"], all_q, p["correctAnswers"])
    raw = call_gemini(prompt)
    obj = parse_json_obj(raw)

    for q in all_q:
        key = f"q{q['id']}"
        item = obj.get(key, {}) if isinstance(obj, dict) else {}
        p["explanations"][key] = {
            "text": item.get("text", "Explanation generated based on passage evidence."),
            "quote": item.get("quote", ""),
        }


final_data = {
    "testInfo": {
        "totalQuestions": 40,
        "totalTime": 60,
        "passages": 3,
    },
    "passages": passages,
}

js = (
    "// IELTS Reading Test 41 - Generated 04/02/2026\n"
    "// Passage 1: Dolls Through the Ages | Passage 2: The power of music | Passage 3: Yawning\n\n"
    "window.IELTS_READING_TEST = " + json.dumps(final_data, ensure_ascii=False, indent=4) + ";\n"
)

out = r"questions IELTS R\ielts-reading-test-41.js"
with open(out, "w", encoding="utf-8") as f:
    f.write(js)

print(f"Done: {out}")
