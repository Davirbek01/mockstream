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
                ["curl.exe", "-s", "--max-time", "180", "-X", "POST", "-H", "Content-Type: application/json", "-d", "@" + tmp_path, URL],
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
Return ONLY valid JSON object with keys like q1, q2, ... and values:
{{"text":"short reason","quote":"exact passage quote or empty for not given"}}
Rules:
- concise 1-3 sentences
- learner-friendly
- align strictly with provided answers
- for NOT GIVEN, quote should be empty string

Passage title: {passage_title}
Passage text:
{strip_html(passage_text)}

Questions and answers:
{chr(10).join(q_lines)}
""".strip()


passage1_text = """<h3>The history of the guitar</h3>

<p><strong>An overview of the origins of the modern guitar</strong><br><strong>A</strong> The earliest stringed instruments currently known to archaeologists are bowl harps. For millenia, people made bowl harps using, for example, tortoise shells as resonators, with a bent stick for a neck and one or more gut or silk strings. The world's museums contain many such harps from the ancient Sumerian, Babylonian, and Egyptian civilisations. Around 2500-2000 BC more advanced harps, such as the beautiful carved 11-stringed instrument found in the tomb of Queen Shub-Ad in ancient Mesopotamia, now modern day Iraq, started to appear.</p>

<p><strong>B</strong> The tanbur* probably developed from the bowl harp. It was different from the bowl harp in that its neck was straightened out to allow the strings to be pressed down to create more notes. Tomb paintings and stone carvings in Egypt indicate that harps and tanburs — plus flutes and percussion instruments — were being played together 3,500-4,000 years ago. Archaeologists have also found many similar relics amongst the ruins of the ancient Mesopotamian civilisation. Many of these instruments have survived into modern times in almost unchanged form, for example folk instruments of the region such as the Turkish saz and Afghan panchtar.</p>

<p><strong>C</strong> At 3,500 years old, the tanbur which belonged to the Egyptian singer Har-Mose is the earliest known example of this instrument. Har-Mose's tanbur had three strings and a plectrum suspended from the neck by a cord. The soundbox, which increased the volume, was made of beautifully polished cedar and covered in rawhide. It can be seen today at the Archaeological Museum in Cairo.</p>

<p><strong>D</strong> In order to distinguish guitars from other stringed instruments, it is helpful to have a broad definition of the guitar. Music expert Dr Michael Kasha defines a guitar as having 'a long, fretted neck, flat wooden soundboard, ribs, and a flat back, most often with sides that curve inwards'. The oldest known visual representation of such an instrument is a stone carving at Alaca Huyuk in Turkey, which shows a 3,300-year-old instrument with a long neck and sides that clearly curve inwards.</p>

<p><strong>E</strong> The name 'guitar' comes from the ancient Sanskrit word for 'string' — 'tar'. Many popular stringed instruments used in central Asia today have existed in an unchanged form for several thousand years, as shown by archaeological finds in the area. Many have names that end in 'tar', with a prefix indicating the number of strings, such as the doter, a two-stringed instrument found in Turkestan, and the Persian three-stringed setar and four-stringed charter. The Indian sitar almost certainly took its name from the setar, but over the centuries it evolved radically, following the Indians' own aesthetic and cultural ideals.</p>

<p><strong>F</strong> Tanburs and harps spread around the ancient world with travellers, merchants and seamen. The earliest guitar-like instruments to arrive in Europe had, most often, four strings. Many such instruments, and variations with from three to five strings, can be seen in mediaeval illustrated manuscripts. They were also carved in stone in European churches and cathedrals from the first century AD right up until the 13th century.</p>

<p><strong>G</strong> When the four-stringed Persian chartar arrived in Spain, however, it changed in form and construction, acquiring pairs of strings tuned to the same note instead of single strings. It became known as the chitarra. By the middle of the 14th century, the chitarra had become dominant, at least in most of Europe. The earliest known music for the eight-stringed chitarra was written in 16th-century Spain. The ten-string version first appeared in Italy at the same time, and gradually replaced the eight-stringed instrument. A further two strings first appeared in the 17th century, an innovation which guitar makers all over Europe quickly took up. However, this twelve-string arrangement gradually gave way to six single strings across the continent. The six-stringed guitar can thus be said to be a development of the twelve-stringed, rather than vice versa, as was thought previously.</p>

<p><strong>H</strong> At the beginning of the 19th century, the present-day guitar began to take shape, although bodies were still fairly small and narrow-waisted. The modern classical guitar first appeared in its current form in the mid-19th century, when the Spanish guitar maker Antonio Torres increased the size of the body, altered its proportions, and introduced the revolutionary fan-braced top**. His design radically increased the volume and has improved the tone of the instrument, and very soon became the norm. This design has remained essentially unchanged to this day.</p>

<p><strong>I</strong> At the time when Torres made his breakthrough, German immigrants to America among them Christian Fredrich Martin — began making guitars with X-braced tops. Steel strings, which became widely available several decades later in the early 1900s, offered the promise of much louder guitars, but the increased tension was too much for the fan-braced top. The stronger X-braced top proved equal to the job, and quickly became industry standard.</p>

<p><strong>J</strong> At the end of the 19th century, guitar manufacturer Orville Gibson added steel strings to a body constructed like a cello, a combination which produced more volume. The electric guitar was born when pickups were fitted to Hawaiian and jazz guitars in the late 1920s, but met with little success until 1936, when Gibson introduced its famous ES150 model.</p>

<p>* tanbur: a long-necked stringed instrument with a small pear-shaped body</p>
<p>** fan-braced top: a strengthening structure in the shape of a fan inserted into the soundbox</p>"""

passage2_text = """<h3>Playing Soccer</h3>

<p><strong>A</strong> Street soccer, as its name implies, is an informal variation of the sport, often played on the street, particularly in urban areas. There are many reasons for the widespread popularity of street soccer. Unlike youth soccer, its more formally organized counterpart, no long space is needed, and goal posts, corner markers, and market lines associated with the formal game, are typically absent, as are game officials or referees. Another attraction of street soccer is that it is played frequently and competitively, but does not necessarily require standard 11-a-side teams o fixed playing positions. Unlike in youth soccer, inexperienced street soccer players rarely learn from repetitive technical and tactical drills. Instead, they learn from their poor performance in competition, unconscious of the skills they are nonetheless developing, and without older adults or coaches present. Players learn with out effort through playing the game, and soon attain an almost natural feeling for the sport.</p>

<p><strong>B</strong> However, there are lots of cities in the world today where conditions are such that street soccer is no longer possible. Congested traffic now dominates where games were once played. Parks and open fields are used as hangouts for older teenagers with other interests. Add to this the requirement in many localities for official permits to use public spaces and the managed schedules that many young people have today, and spontaneous play of any kind is hard to imagine.</p>

<p><strong>C</strong> In spite of all these obstacles, which are probably solvable in most instances, there is another sociological explanation of why in many places street soccer doesn't enjoy the same popularity it once did. In his book How Soccer Explains the World, US writer Franklin Foer observes: But for all the talk of freedom, the 1960s parenting style had a far less relaxed side too. Like the 1960s consumer movement which brought seat belts and airbags to cars, the (youth) soccer movement felt like it could create a set of ... regulations that would protect both the child and mind from damage. Soccer leagues like the one I played in as a child handed out 'participation' prizes to every player, no matter how few games his (or her) team won.... Where most of the world accepts the practice of using your head to hit the ball as an essential element of the game, some (youth) soccer parents have worried over the potential for injury to the brain. An entire industry grew up to manufacture protective headgear.... Even though very little medical evidence supports this fear, some youth leagues prohibited heading the ball altogether.</p>

<p><strong>D</strong> A growing body of people don't believe street soccer involves a legitimate educational method. They argue that children need to be taught by experts. Youth soccer instruction now begins with four-year-olds, so that they will have an advantage as six-year-olds. This need to get ahead brings with it a fear of falling behind that only expert instruction can prevent. This type of instruction leaves no room for the trial and error approach of street soccer.</p>

<p><strong>E</strong> One of the basic ideas of street soccer is that young players are assigned a particular role by a better player and are expected to play for the good of the team. Such an assignment runs counter to the idea of youth soccer that every child needs to learn every position and will benefit from doing so. In street soccer, you fill the role that you are best suited to at a particular time. While this role assignment can change from game to game, the purpose is always the same: to get the best out of each individual at any given moment.</p>

<p><strong>F</strong> In street soccer, children have to learn patience, to wait their turn, to realize that they are not entitled to make decisions, or even be listened to simply because they speak up. Positions of responsibility are earned through competition within the team. Younger players in street soccer must wait to attain those positions. In youth soccer, however, with its overly democratic values, youngsters are guaranteed their time in the spotlight.</p>

<p>Whether it's their turn to be captain, to play a central position or to take a crucial shot, youth soccer players come to believe that hard work and patience aren't really necessary.</p>

<p><strong>G</strong> Not only does every youth soccer player get a chance, it is assumed that each individual has played well. 'Everyone's a winner; no one's a loser' is a guiding principle of youth soccer. This ensures each individual goes away positive about him/herself. No one can leave a game or a practice feeling bad. But, if there really are no losers, then why try at all? Since giving less than your best receives the same reward as giving your best, why go to any extra effort? In street soccer, every game results in a winner and a loser and everyone knows who is who. Losing a game is a common experience and players learn early on how to handle this. As a result, unlike most youth soccer players, they acquire resilience. A further difference between these two strands of soccer is that in street soccer a formal record is not kept. You can lose one day and win the next. The results are only temporary and are forgotten within minutes of the end of the match. But in organized youth soccer, the position each person plays and the results are formally noted and maintained throughout a season.</p>"""

passage3_text = """<h3>Jean Piaget 1896-1980</h3>

<p><em>Seymour Papert looks at the work of the pioneering Swiss philosopher and psychologist</em></p>

<p><strong>1.</strong> Jean Piaget spent much of his professional life listening to children, watching children and poring over reports of researchers around the world who were doing the same. He found, to put it most succinctly, that children don't think like grown-ups. After thousands of interactions with young people often barely old enough to talk, Piaget began to suspect that behind their cute and seemingly irrational utterances were thought processes that had their own kind of order and their own special logic. Einstein called it a discovery so simple that only a genius could have thought of it.</p>

<p><strong>2.</strong> Although not an educational reformer, Piaget championed a way of thinking about children that provided the foundation for today's education-reform movements. It was a shift comparable to the way modern anthropology displaced stories of primitive tribes being 'noble savages' and 'cannibals'. One might say that Piaget was the first to take children's thinking seriously.</p>

<p><strong>3.</strong> He has been revered by generations of teachers inspired by the belief that children are not empty vessels to be filled with knowledge (as traditional pedagogical theory had it) but active builders of knowledge-little scientists who are constantly creating and testing their own hypotheses about the world. And though he may not be as famous as Sigmund Freud or even B F Skinner, his influence on psychology may be longer lasting.</p>

<p><strong>4.</strong> In 1920, while doing research in a child-psychology laboratory in Paris, Piaget noticed that children of the same age made similar errors on intelligence tests. Fascinated by their reasoning processes, he began to suspect that the key to human knowledge might be discovered by observing how the child's mind develops. On his return to Switzerland he began watching children play, scrupulously recording their words and actions as their minds raced to find reasons for why things are way they are. In one of his most famous experiments, Piaget asked children, 'What makes the wind?'. A typical dialogue would be:<br>Piaget: What makes the wind?<br>Julia: The trees<br>Piaget: How do you know?<br>Julia: I saw them waving their arms.<br>Piaget: How does that make the wind?<br>Julia: (waving her hand in front of his face): Like this. Only they are bigger. And there are lots of trees.</p>

<p><strong>5.</strong> Piaget recognised that five-year-old Julia's beliefs, while not correct by any adult criterion, are not 'incorrect' either. They are entirely sensible and coherent within the framework of the child's way of knowing. Classifying them as 'true' or 'false' misses the point and shows a lack of respect for the child. What Piaget was after was a theory that the wind dialogue demonstrated coherence, ingenuity and the practice of a kind of explanatory principle (in this case by referring to body actions) that stands young children in very good stead when they don't know enough or don't have enough skill to handle the kind of explanation that grown-up prefer.</p>

<p><strong>6.</strong> Piaget was not an educator and never laid down rules about how to intervene in such situations. But his work strongly suggests that the automatic reaction of putting the child right may well be counter-productive. If their theories are always greeted by 'Nice try, but this is how it really is...' they might give up after a while on making theories. As Piaget put it, 'children have real understanding only of that which they invent themselves, and each time that we try to teach them something too quickly, we keep them from inventing it themselves.</p>

<p><strong>7.</strong> Disciples of Piaget have later-for indeed a fascination with-children's primitive laws of physics: that things disappear when they are out of sight; that the moon and the sun follow you around; that big things float and small things sink. Einstein was intrigued by Piaget's findings, especially by the idea that seven-year-olds insist that going faster can take more time-perhaps because, like Einstein's own theories of relativity, runs so contrary to common sense.</p>

<p><strong>8.</strong> Although every teacher in training still memorises Piaget's successive stages of childhood development, the greater part of Piaget's work is less well known, perhaps because schools of education regard it as 'too deep' for teachers. Piaget never thought of himself as a child psychologist. His real interest was epistemology-the theory of knowledge-which, like physics, was considered a branch of philosophy until Piaget came along and made it a science.</p>

<p><strong>9.</strong> Through epistemology, Piaget explored multiple ways of knowing. He acknowledged them and examined them non-judgementally, yet with a philosopher's analytic rigour. Since Piaget, the territory has been widely colonised by those who write about ways of knowing, ways of intelligence ways of knowing, even the computer's ways of knowing. Indeed, artificial intelligence and the information-processing model of the mind owe more to Piaget than its proponents may realise.</p>

<p><strong>10.</strong> The core of Piaget is his belief that looking carefully at how knowledge develops in children will elucidate the nature of knowledge in general. Whether this has in fact led to deeper understanding remains, like everything about Piaget, controversial. In the past decade, Piaget has been vigorously challenged by the current fashion of viewing knowledge as an intrinsic property of the brain. Ingenious experiments have demonstrated that newborn infants already have some of the knowledge that Piaget believed children constructed. But for those, like we, who still see Piaget as the giant in the field of cognitive theory, the difference between what the baby brings and what the adult has is so immense that the new discoveries do not significantly reduce the gap, but only increase the mystery.</p>"""

p1_sections = [
    {
        "type": "tfng",
        "typeName": "True/False/Not Given",
        "title": "Questions 1-6",
        "instruction": "Questions 1-6\n\nChoose TRUE if the statement agrees with the information in the text, choose FALSE if the statement contradicts the information, or choose NOT GIVEN if there is no information on this.",
        "headingsList": [],
        "featuresList": [],
        "questions": [
            {"id": 1, "text": "The instrument found in Queen Shub-Ad's tomb is the world's oldest known version of a harp."},
            {"id": 2, "text": "Today's Afghan panchtar is very similar to an ancient Mesopotamian instrument."},
            {"id": 3, "text": "The Egyptian singer Har-Mose was an excellent tanbur player."},
            {"id": 4, "text": "Cairo Archaeological Museum contains many historic musical instruments."},
            {"id": 5, "text": "The instrument carved in stone at Alaca Huyuk is consistent with Dr Michael Kasha's definition of a guitar."},
            {"id": 6, "text": "The different instruments that appeared in medieval literature had the same number of strings."}
        ]
    },
    {
        "type": "completion",
        "typeName": "Table Completion",
        "title": "Questions 7-13",
        "instruction": "Questions 7-13\n\nComplete the table below.\n\nWrite ONE WORD ONLY from the passage for each answer.",
        "headingsList": [],
        "featuresList": [],
        "questions": [
            {"id": 7, "text": "<strong>The development of the guitar</strong><br><strong>13th-19th century</strong> Chitarra<br>was a development of an earlier instrument called the {INPUT}<br>extra strings added in 16th century in Italy"},
            {"id": 8, "text": "<strong>from around the 1850s</strong> Classical guitar<br>its shape a result of modifications including a larger {INPUT} introduced by Antonio Torres"},
            {"id": 9, "text": "changes produced better tone and greater {INPUT}"},
            {"id": 10, "text": "<strong>X-braced top guitar</strong><br>first made in {INPUT} in mid-19th century"},
            {"id": 11, "text": "strings made of {INPUT} became available around 1900"},
            {"id": 12, "text": "<strong>1920s onwards</strong> Electric guitar<br>in the 1920s, {INPUT} added to guitars"},
            {"id": 13, "text": "a well-known version brought out by {INPUT}"}
        ]
    }
]

p2_sections = [
    {
        "type": "matching-info",
        "typeName": "Matching Information",
        "title": "Questions 14-19",
        "instruction": "Questions 14-19<br><br>Reading Passage 2 has seven sections, <strong>A-G</strong>. Which section contains the following information?<br><br>Choose the correct letter, <strong>A-G</strong>, for boxes 14-19.",
        "headingsList": [],
        "featuresList": ["A", "B", "C", "D", "E", "F", "G"],
        "questions": [
            {"id": 14, "text": "a contrast between the ways young players gain experience of playing different positions"},
            {"id": 15, "text": "examples outside sport of greater emphasis on individual safety"},
            {"id": 16, "text": "a description of methods of selection for leadership on soccer teams"},
            {"id": 17, "text": "details of urban changes that discourage street soccer"},
            {"id": 18, "text": "a mention of the lesson that failure teaches street soccer players"},
            {"id": 19, "text": "an explanation of why youth soccer emphasises the need for coaches"}
        ]
    },
    {
        "type": "mcq",
        "typeName": "Multiple Choice (Multiple Answers)",
        "title": "Questions 20-21",
        "instruction": "Questions 20-21<br><br>Choose TWO correct answers.<br><br>The list below gives some possible reasons for the popularity of street soccer. Which TWO of these reasons are mentioned by the writer of the text?",
        "headingsList": [],
        "featuresList": [],
        "questions": [
            {"id": 20, "text": "(Choice 1)", "options": ["Many famous soccer players got their start in street soccer.", "Young people can begin playing street soccer at a very early age.", "You do not need elaborate facilities to play street soccer.", "Inexperienced street soccer players are not criticised for mistakes.", "Street soccer teams can have varying numbers of players."]},
            {"id": 21, "text": "(Choice 2)", "options": ["Many famous soccer players got their start in street soccer.", "Young people can begin playing street soccer at a very early age.", "You do not need elaborate facilities to play street soccer.", "Inexperienced street soccer players are not criticised for mistakes.", "Street soccer teams can have varying numbers of players."]}
        ]
    },
    {
        "type": "mcq",
        "typeName": "Multiple Choice (Multiple Answers)",
        "title": "Questions 22-23",
        "instruction": "Questions 22-23<br><br>Choose TWO correct answers.<br><br>The list below gives some possible results of the 1960s parenting style. Which TWO of these are mentioned by Franklin Foer in the excerpt from <em>How Soccer Explains the World</em>?",
        "headingsList": [],
        "featuresList": [],
        "questions": [
            {"id": 22, "text": "(Choice 1)", "options": ["Participation in youth soccer became much more expensive.", "Some youth soccer leagues adopted more restrictive rules of play.", "Fewer young people joined youth soccer teams.", "Youth soccer players were sometimes rewarded for simply playing in games.", "Soccer equipment manufacturers directed advertising towards parents."]},
            {"id": 23, "text": "(Choice 2)", "options": ["Participation in youth soccer became much more expensive.", "Some youth soccer leagues adopted more restrictive rules of play.", "Fewer young people joined youth soccer teams.", "Youth soccer players were sometimes rewarded for simply playing in games.", "Soccer equipment manufacturers directed advertising towards parents."]}
        ]
    },
    {
        "type": "completion",
        "typeName": "Summary Completion",
        "title": "Questions 24-26",
        "instruction": "Questions 24-26<br><br>Complete the summary below.\n\nWrite ONE WORD ONLY from the passage for each answer.",
        "headingsList": [],
        "featuresList": [],
        "questions": [
            {"id": 24, "text": "<strong>Winners and losers</strong><br>For youth soccer players, a key {INPUT} is that they should always come away from the game with a positive attitude."},
            {"id": 25, "text": "In this respect, regardless of the effort the players make, they get some kind of {INPUT} at the end of a game."},
            {"id": 26, "text": "In street soccer, however, players gain resilience because they have to learn to cope with failure. But the outcome of a match isn't remembered for long. In fact, no-one ever keeps a {INPUT} of the results of games."}
        ]
    }
]

p3_sections = [
    {
        "type": "mcq",
        "typeName": "Multiple Choice",
        "title": "Questions 27-31",
        "instruction": "Questions 27-31<br><br>Choose the correct letter, <strong>A, B, C or D</strong>.<br><br>Write the correct letter in boxes 27-31 on your answer sheet.",
        "headingsList": [],
        "featuresList": [],
        "questions": [
            {"id": 27, "text": "In the second paragraph the writer mentions the example of modern anthropology to illustrate", "options": ["the universality of Piaget's insights into the workings of the mind.", "the similarity between children's thought processing in different cultures.", "how Piaget's work represents a crucial turning-point in our approach to education.", "how Piaget's work has aided our understanding of man's evolution from primitive origins."]},
            {"id": 28, "text": "According to the writer, what point is illustrated by the dialogue about the wind?", "options": ["The factual accuracy of what children say is of minor significance.", "Children want to learn about scientific principles.", "Children's reasoning processes can be amusing to adults.", "Children often pretend that they know the answers to questions."]},
            {"id": 29, "text": "Piaget believed in the importance of", "options": ["preventing children from making false assumptions.", "giving children honest feedback on their hypotheses.", "showing children how to formulate their own ideas about the world.", "maintaining children's confidence in their ability to interpret the world."]},
            {"id": 30, "text": "What does the writer suggest in the seventh paragraph?", "options": ["Children's sense of their surroundings changes as they get older.", "Children are able to grasp certain complex ideas as well as adults are.", "Even apparently irrational ideas can be worthy of interest.", "Sometimes the simplest explanations are the best."]},
            {"id": 31, "text": "The writer's main purpose is to", "options": ["outline Piaget's contribution to a range of scientific fields.", "summarise how education has benefited from Piaget's findings.", "discuss Piaget's role in the development of 20-century psychology.", "express doubts about a number of Piaget's theories."]}
        ]
    },
    {
        "type": "list-selection",
        "typeName": "Summary Completion (List)",
        "title": "Questions 32-36",
        "instruction": "Questions 32-36<br><br>Complete the summary using the list of words, <strong>A-I</strong>, below.\n\nWrite the correct letter <strong>A-I</strong>, in boxes 32-36 on your answer sheet.",
        "boxTitle": "List of words",
        "headingsList": [],
        "featuresList": [
            "A correct",
            "B theories",
            "C brain",
            "D simple",
            "E teachers",
            "F psychology",
            "G logical",
            "H thought",
            "I philosophers"
        ],
        "questions": [
            {"id": 32, "text": "Piaget maintained that children's mental processes were far more {INPUT} than they might appear."},
            {"id": 33, "text": "He encouraged the view that a child was not a 'blank slate' waiting to be filled with information, but rather a systematic builder of knowledge who regularly tries out his or her own {INPUT} about the world."},
            {"id": 34, "text": "Piaget's impact on the area of {INPUT} could well outlast that of more celebrated pioneers of this discipline."},
            {"id": 35, "text": "Despite doubts cast over his ideas by the current view associating knowledge exclusively with the {INPUT}, the effects of his work are still strong today."},
            {"id": 36, "text": "His principles are still widely used in the professional development of {INPUT}."}
        ]
    },
    {
        "type": "ynng",
        "typeName": "Yes/No/Not Given",
        "title": "Questions 37-40",
        "instruction": "Questions 37-40<br><br>Do the following statements agree with the claims of the writer in Reading Passage 3?\n\nIn boxes 37-40 on your answer sheet, write\n\n<strong>YES</strong> if the statement agrees with the claims of the writer\n<strong>NO</strong> if the statement contradicts the claims of the writer\n<strong>NOT GIVEN</strong> if it is impossible to say what the writer thinks about this",
        "headingsList": [],
        "featuresList": [],
        "questions": [
            {"id": 37, "text": "Piaget's early work in Paris involved innovative research techniques."},
            {"id": 38, "text": "Piaget gave clear guidelines as to how adults should give information to children."},
            {"id": 39, "text": "Piaget made a significant contribution to the field of epistemology."},
            {"id": 40, "text": "We still have much to learn about the nature of knowledge."}
        ]
    }
]

correct_answers = {
    "q1": ["FALSE"],
    "q2": ["TRUE"],
    "q3": ["NOT GIVEN"],
    "q4": ["NOT GIVEN"],
    "q5": ["TRUE"],
    "q6": ["FALSE"],
    "q7": ["chartar"],
    "q8": ["body"],
    "q9": ["volume"],
    "q10": ["America"],
    "q11": ["steel"],
    "q12": ["pickups"],
    "q13": ["Gibson"],

    "q14": ["E"],
    "q15": ["C"],
    "q16": ["F"],
    "q17": ["B"],
    "q18": ["G"],
    "q19": ["D"],
    "q20": ["C"],
    "q21": ["E"],
    "q22": ["B"],
    "q23": ["D"],
    "q24": ["principle"],
    "q25": ["reward"],
    "q26": ["record"],

    "q27": ["C"],
    "q28": ["A"],
    "q29": ["D"],
    "q30": ["C"],
    "q31": ["C"],
    "q32": ["G"],
    "q33": ["B"],
    "q34": ["F"],
    "q35": ["I"],
    "q36": ["E"],
    "q37": ["NOT GIVEN"],
    "q38": ["NO"],
    "q39": ["YES"],
    "q40": ["YES"]
}

passages = [
    {
        "id": 1,
        "title": "The history of the guitar",
        "shortName": "The history of guitar",
        "difficulty": "Easy",
        "questionRange": "1-13",
        "timeRecommended": 20,
        "passageHeader": {
            "title": "READING PASSAGE 1",
            "instruction": "You should spend about 20 minutes on <strong>Questions 1-13</strong>, which are based on Reading Passage 1 below."
        },
        "passage": passage1_text,
        "questionSections": p1_sections,
        "correctAnswers": {k: v for k, v in correct_answers.items() if 1 <= int(k[1:]) <= 13},
        "explanations": {}
    },
    {
        "id": 2,
        "title": "Playing Soccer",
        "shortName": "Playing soccer",
        "difficulty": "Medium",
        "questionRange": "14-26",
        "timeRecommended": 20,
        "passageHeader": {
            "title": "READING PASSAGE 2",
            "instruction": "You should spend about 20 minutes on <strong>Questions 14-26</strong>, which are based on Reading Passage 2 below."
        },
        "passage": passage2_text,
        "questionSections": p2_sections,
        "correctAnswers": {k: v for k, v in correct_answers.items() if 14 <= int(k[1:]) <= 26},
        "explanations": {}
    },
    {
        "id": 3,
        "title": "Jean Piaget 1896-1980",
        "shortName": "Jean piaget",
        "difficulty": "Hard",
        "questionRange": "27-40",
        "timeRecommended": 20,
        "passageHeader": {
            "title": "READING PASSAGE 3",
            "instruction": "You should spend about 20 minutes on <strong>Questions 27-40</strong>, which are based on Reading Passage 3 below."
        },
        "passage": passage3_text,
        "questionSections": p3_sections,
        "correctAnswers": {k: v for k, v in correct_answers.items() if 27 <= int(k[1:]) <= 40},
        "explanations": {}
    }
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
            "quote": item.get("quote", "")
        }

final_data = {
    "testInfo": {
        "totalQuestions": 40,
        "totalTime": 60,
        "passages": 3
    },
    "passages": passages
}

js = "// IELTS Reading Test 43 - Generated 04/02/2026\n" \
     "// Passage 1: The history of the guitar | Passage 2: Playing Soccer | Passage 3: Jean Piaget 1896-1980\n\n" \
     "window.IELTS_READING_TEST = " + json.dumps(final_data, ensure_ascii=False, indent=4) + ";\n"

out = r"questions IELTS R\ielts-reading-test-43.js"
with open(out, "w", encoding="utf-8") as f:
    f.write(js)

print(f"Done: {out}")
