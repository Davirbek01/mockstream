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


passage1_text = """<h3>Katsushika Hokusai</h3>

<p>Hokusai (born October 1760, Edo [now Tokyo], Japan-died May 10, 1849, Edo) was a Japanese master artist and printmaker of the Ukiyo-e ('pictures of the floating world') school. His early works represent the full spectrum of Ukiyo-e art, including single-sheet prints of landscapes and actors, hand paintings, and surimono ('printed things'), such as greetings and announcements. Later he concentrated on the classical themes of the samurai and Chinese subjects. His famous print series "Thirty-six Views of Mount Fuji," published between 1826 and 1833, marked the summit in the history of the Japanese landscape print.</p>

<p><strong>Early years</strong><br>Hokusai was born in the Honjo quarter just east of Edo (Tokyo) and became interested in drawing at the age of five. He was adopted in childhood by a prestigious artisan family named Nakajima but was never accepted as an heir-possibly supporting the theory that, though the true son of Nakajima, he had been born of a concubine.</p>

<p>Hokusai is said to have served in his youth as clerk in a lending bookshop, and from 15 to 18 years of age he was apprenticed to a wood-block engraver. This early training in the book and printing trades obviously contributed to Hokusai's artistic development as a printmaker.</p>

<p>The earliest contemporary record of Hokusai dates from the year 1778, when, at the age of 18, he became a pupil of the leading Ukiyo-e master, Katsukawa Shunsho. The young Hokusai's first published works appeared the following year-actor prints of the Kabuki theatre, the genre that Shunsho and the Katsukawa school practically dominated.</p>

<p>To judge from the ages of his several children, Hokusai must have married in his mid-20s. Possibly under the influence of family life, from this period his designs tended to turn from prints of actors and women to historical and landscape subjects, especially Uki-e (semi-historical landscapes using Western-influenced perspective techniques), as well as prints of children.</p>

<p>Artist's book illustrations and texts turned as well from the earlier themes to historical and didactic subjects. At the same time, Hokusai's work in the surimono genre during the subsequent decade marks one of the early peaks in his career. Surimono were prints issued privately for special occasions-New Year's and other greetings, musical programs and announcements, private verse selections-in limited editions and featuring immaculate printing of the highest quality.</p>

<p>Hokusai's early 30s were to prove years of personal change. His master Shunsho died early in 1793, and somewhat later Hokusai's young wife passed away, leaving a son and two daughters. In the year 1797 he remarried and adopted the name Hokusai. This change of name marks the beginning of the golden age of his work, which was to continue for a half century.</p>

<p><strong>Mature years</strong><br>In format, Hokusai's oeuvre from this period covers the gamut of Ukiyo-e art: single-sheet prints, surimono, picture books and picture novelettes, illustrations to verse anthologies and historical novels, erotic books and album prints, and hand paintings and sketches. In his subject matter, Hokusai only occasionally (in a few notable prints, in paintings, and erotica) chose to compete with Utamaro, the acknowledged master of voluptuous figure prints. Aside from this limitation, however, Hokusai's work encompassed a wide range, with particular emphasis on landscape views and historical scenes in which figures were often of secondary interest. Around the turn of the century he experimented for a time with Western-style perspective and colouring.</p>

<p>From the early 19th century Hokusai commenced illustrating yomihon (the extended historical novels that were just coming into fashion). Under their influence, his style began to suffer important and clearly visible changes between 1806 and 1807. His figure work becomes more powerful but increasingly less delicate; there is greater attention to classical or traditional themes (especially of samurai, or warriors, and Chinese subjects) and a turning away from contemporary Ukiyo-e world.</p>

<p>In about the year 1812, Hokusai's eldest son died. This tragedy was not only an emotional but also an economic event, for, as adopted heir to the affluent Nakajima family, the son had been instrumental in obtaining a generous stipend for Hokusai, so that he did not need to worry about the uncertainties of income from his paintings, designs, and illustrations, which at this period were paid for more with "gifts" than with set fees.</p>

<p>Whether for economic reasons or not, from this time on Hokusai's attention turned gradually from novel illustration to the picture book and, particularly, to the type of wood-block-printed copybook designed for amateur artists (including the famous Hokusai manga). Very likely his intention was to find new pupils and hence new patronage, and in this he succeeded to some degree.</p>

<p>Though famed for his detailed prints and illustrations, Hokusai was also fond of displaying his artistic prowess in public-making, for example, huge paintings (some fully 200 square metres [about 2,000 square feet] in area) of mythological figures before festival crowds, in both Edo and Nagoya. He was once even summoned to show his artistic skills before the shogun (the military leader who, although theoretically subordinate to the emperor, was in fact the ruler of Japan).</p>

<p>In the summer of 1828, Hokusai's second wife died. The master was then 68, afflicted intermittently with paralysis and left alone, evidently with only a profligate grandson, who had proved to be an incorrigible delinquent. It is probably no coincidence, therefore, that before long Hokusai's favourite daughter (and pupil), O-ei, broke her unhappy marriage with a minor artist named Tomei and returned to her father's side, where she was to stay for his remaining years.</p>

<p>An energetic artist, Hokusai rose early and continued painting until well after dark. This was the customary regimen of his long, productive life. Of Hokusai's thousands of books and prints, his "Thirty-six Views of Mt. Fuji" is particularly notable (see photograph). Published from about 1826 to 1833, this famous series (including supplements, a total of 46 colour prints) marked a summit in the history of the Japanese landscape print; in grandeur of concept and skill of execution there was little approaching it before and nothing to surpass it later-even in the work of Hokusai's famed late contemporary Hiroshige (q.v.).</p>

<p>Hokusai's frequent changes in domicile (more than 90 dwellings) and of his own name are indicative of the artist's restless nature. Besides his principal noms d'artiste (roughly one per decade), the artist had also some two dozen other occasional pseudonyms, though these were normally used as adjuncts to his principal name of a given period.</p>

<p>Despite his appeals to heaven for "yet another decade-a, even another five years," on the 18th day of the fourth month of the Japanese calendar "the old man mad with painting," as he called himself, breathed his last. He was 89 but still insatiably seeking for an ultimate truth in art-as he had written 15 years earlier:</p>

<p>From the age of five I have had a mania for sketching the forms of things. From about the age of 50 I produced a number of designs, yet of all I drew prior to the age of 70 there is truly nothing of any great note. At the age of 73 I finally apprehended something of the true quality of birds, animals, insects, fishes, and of the vital nature of grasses and trees. Therefore, at 80 I shall have made some progress, at 90 I shall have penetrated even further the deeper meaning of things, at 100 I shall have become truly marvelous, and at 110, each dot, each line shall surely possess a life of its own. I beg that gentlemen of sufficiently long life take care to note the truth of my words.</p>

<p><strong>Legacy</strong><br>Hokusai embodied in his long lifetime the essence of the Ukiyo-e school of art during its final century of development. His stubborn genius also represents, in its 70 years of continuous artistic creation, the prototype of the single-minded artist, striving only to complete a given task. Moreover, Hokusai constitutes a figure who has, since the later 19th century, impressed Western artists, critics, and art lovers alike, more, possibly, than any other single Asian artist.</p>"""

passage2_text = """<h3>200 Years of Australian Landscapes at the Royal Academy in London</h3>

<p>This exhibition promises to chart the evolution of a nation through its art, but not everyone agrees with the reasons behind the choice of artwork.</p>

<p>For the casual viewer, the exhibition of landscapes, Australia, selected by the Royal Academy of Art, will be a spectacular guide through Australian art history. Included in the exhibition are a range of artists and styles, dating from the earliest days of colonial art and progressing through expressionism and modernism to the greats of the 20th century, culminating with the current generation of Australian artists. It is hardly surprising, then, that this results in a flexible, wide-ranging notion of landscape.</p>

<p>But this landmark exhibition gives rise to some questions, and perhaps problems, regarding Britain's relationship with its former colony. By choosing a style of painting at which British artists excel, the Academy could be seen as inviting criticism that it a telling attitude towards Australian art by comparison. But it is the very theme of landscape that provides the strongest connection to Australian art from Britain. To consider it condescending is perhaps too strong, but for Joanna Mendelssohn, an Australian critic and Associate Professor at the University of NSW's College of Fine Arts (COFA), there is a suggestion that British artistic values have directed this exhibition, rather than allowing Australia the freedom to demonstrate its maturity.</p>

<p>What Mendelssohn found surprising about this exhibition was that the underlying rules for the selection of works seemed to have been so conservative. Since the landscape is a very strong British artistic theme, it appeared to her that when the British looked to the art of a former colony, there was a tendency for them to think that those colonies would continue to be like the British themselves. In reviewing Australia, the British insisted on looking at the genre of landscape painting.</p>

<p>Because of colonial ties, it was inevitable during Australian art's formative years that it would reflect Britain's devotion to the beloved landscape before its own character and idiosyncrasies took shape. And while Mendelssohn's concern over the exhibition's conventional selection is valid, the Academy is nevertheless embracing the peculiarities of Australian art from the mid-19th century onward, albeit within the boundaries of landscape.</p>

<p>Australia is curated by Kathleen Soriano, director of exhibitions at the Royal Academy. "Certainly in the influence of English, French, or German art is much more evident in the early periods, in the early 1800s to mid-1800s," she says. "What I wanted to show was how Australian art develops a real distinctiveness, associated with the landscape and the light."</p>

<p>The fusion of tradition of the European kind with something more specifically Australian, and often personal, is crucial to the exhibition, and extends particularly to some of the more contemporary artists involved. Sydney-born video artist Shaun Gladwell is a good example of this. Gladwell's most famous piece, which is featured in the exhibition, is Storm Sequence (2000), a video of Gladwell skateboarding on the Bondi seafront as one of Sydney's signature brutal storms lingers offshore. It is his acknowledgment of landscape (or 'seascape' tradition, colored by Gladwell's own individualism. "To exhibit my work in this show might make some sense because I was interested in Turner and the idea of atmosphere affecting vision, something I was really interested in around the time of Storm Sequence. I was thinking about this tradition of Romantic landscape, but I wanted to make it personal," says Gladwell. But he didn't want to just embark on borrowing imagery from elsewhere. He wanted to bring it to his experience and his world through skateboarding and beach culture.</p>

<p>So while it may seem narrow for Britain to reduce Australian art to the genre of landscape, there can be little denying that British landscape painting is still relevant to a current generation of Australian practitioners, however indirectly.</p>

<p>Visitors to the exhibition encounter Australian Aboriginal art first, the idea being that these works warrant a prominent position because they were 'first'. Over the last couple of decades, London has hosted many successful exhibitions of Aboriginal art in smaller spaces, but for Soriano, Australia represents an opportunity to place such art in a broader context, with new relationships to the art of the settlers and white Australia. "One of the reasons landscape makes sense as being the right theme was because Aboriginal art started in and on the landscape,' she says. '[The exhibition] is a beautiful meshing of the two different kinds of art, that allowed me to bring them together comfortably and honestly within this theme. It was important for me to present Indigenous art to audiences, and I felt it was most authentic that it was seen as part of Australian art history, rather than a separate area with a world of its own.'</p>

<p>Meanwhile, Australian critic Mendelssohn also points out that London is increasingly less important to today's generation of artists, and this somewhat weakens the ceremony surrounding the exhibition in London. 'China is the most important art market in the world,' she says. 'If you've made it in Shanghai, you've made it. The world has changed. My students in Australia, who come from all over the world, really want to see Venice Biennale and Art Basel, but they're less interested in going to London. When I was growing up, London was the destination, and then when I was at university all the smart young things wanted to go to New York,' she added. 'Now they want to go everywhere. There's no such thing as the centre and the periphery like there used to be. It's much more complicated.'</p>"""

passage3_text = """<h3>Robert Louis Stevenson</h3>

<p><strong>A</strong> It is more than 100 years since the death of the Scottish writer Robert Louis Stevenson on the South Pacific Island of Samoa, and it seems that time has not been kind to Stevenson's memory. Immediately after his death, his family and friends set to work to fashion the legend of Robert Louis Stevenson or RLS, as he became known to one of the few writers familiar from his initials alone. Subsequent works of biography then turned him into a writer of almost religious importance. One example was literary critic Balfour, who in 1901 portrayed Stevenson's family as ministering angels to the dying genius during his final illness. Similarly, the biographer Crouch absurdly overstated Stevenson's significance by placing him in the same company as those most revered names in English literature: Shakespeare and Keats. The reaction to this nonsense was a number of highly critical assessments of Stevenson's legacy in the 1920s.</p>

<p><strong>B</strong> Normally, the critical pendulum can be relied on to swing back again, but there are several aspects of Stevenson's work that have, until recently, acted against a more balanced appraisal. First is the allegation that Stevenson was a mere master of linguistic fireworks, who lacked moral depth. Some critics accused him of being a literary charlatan, of juggling words very prettily to strike effects which overawed an ignorant public, and served to distract from the inadequacy of his ideas.</p>

<p><strong>C</strong> Then there has long been a prejudice against the adventure story as the proper medium for deep moral seriousness, a prejudice which is still extremely influential today. It seems that we can accept that an adventure film can successfully express profound moral truths, but we reject the same idea for a book. The absurdity of this becomes apparent when we think of writers like Joseph Conrad and Graham Greene, but it is no use pretending that this bias against adventure stories is not part of our high culture. A further problem is that Stevenson has often not found favour in the land of his birth because his conservatism so often collides with the strong radical tradition in Scotland. His many escapist stories and preference for living abroad have led to accusations that he camouflaged Scotland's health problems. Lastly the high adventure of Stevenson's own lifestyle has sometimes obscured his output. His globe-trotting, and above all the final phase of his life in Samoa, tended to make his own life a greater story than any he could devise. This was precisely what his friends feared would happen towards the end of his short life: his art might be overwhelmed by the drama of life in Samoa.</p>

<p><strong>D</strong> One consequence of this has been that Stevenson's influence on other writers has too often been neglected. The writer and poet Oscar Wilde was deeply influenced by Stevenson, even though he declared that Stevenson would have produced better work if he had lived in London rather than Samoa. Stevenson to stick in the throat even of those writers who would like to spit him out, such as Shaw, who claimed to have learnt from him that the romantic hero is always mocked by reality. Likewise, the writer Galsworthy, who began as a determined critic, later changed his mind and said that the superiority of Stevenson over the novelist Hardy was that Stevenson was all life and Hardy all death. The influence on the novelist Chesterton would also repay detailed study, for it was through him that Stevenson has managed to cross the ages, emerging as an influence on the modernist movement and our own contemporary Latin American school of 'magical realism'.</p>

<p><strong>E</strong> When making an assessment of his life and work one question must inevitably be asked: was Robert Louis Stevenson Scotland's greatest writer of English prose? For most commentators this honour falls to Sir Walter Scott, author of Ivanhoe among many other classic novels and it is true that in terms of craftsmanship, precision and the ability to minutely regulate language to create the desired effect, Scott takes the Prize. However, this is not something at all as inherent talent: by way of comparison one may take the example of the two great Russian composers Shostakovich and Prokofiev, of whom the former had learned more precise skills of execution but the latter's intrinsic genius was greater, and so it seems to be with Scott and Stevenson. Admittedly, Scott's detailed style does permit his stories to explore levels of tragedy that are beyond Stevenson's reach, but in this regard they have the musty smell of the museum, somewhat artificial and removed from modern day reality. On the other hand, Stevenson's skill with plotting and narrative give his books a timeless quality, so that they still live today. And Stevenson was also the shrewder judge of behaviour and psychology. For example, his compelling descriptions of a man with a split personality in The Strange Case of Dr. Jekyl and Mr. Hyde have proved so accessible and accurate that the expression 'Jekyll and Hyde' has entered common English usage. Even if we do not see a revival of critical interest in this great Scottish writer, it is to be hoped that readers go back to Robert Louis Stevenson's magnificent stories and reassess this neglected genius.</p>"""

p1_sections = [
    {
        "type": "tfng",
        "typeName": "True/False/Not Given",
        "title": "Questions 1-7",
        "instruction": "Questions 1-7\n\nChoose TRUE if the statement agrees with the information in the text, choose FALSE if the statement contradicts the information, or choose NOT GIVEN if there is no information on this.",
        "headingsList": [],
        "featuresList": [],
        "questions": [
            {"id": 1, "text": "Hokusai's earliest artistic works mainly focused on landscapes and actors."},
            {"id": 2, "text": "He was officially recognized as the heir of the Nakajima family."},
            {"id": 3, "text": "Hokusai's apprenticeship with a wood-block engraver contributed to his later success as a printmaker."},
            {"id": 4, "text": "The series Thirty-six Views of Mount Fuji was the first landscape work ever created in Japan."},
            {"id": 5, "text": "Hokusai often competed with Utamaro in producing prints of women."},
            {"id": 6, "text": "His eldest son helped secure financial stability for him through the Nakajima family connections."},
            {"id": 7, "text": "Hokusai changed his residence and artistic name multiple times throughout his life."}
        ]
    },
    {
        "type": "completion",
        "typeName": "Summary Completion",
        "title": "Questions 8-13",
        "instruction": "Questions 8-13\n\nComplete the summary below.\n\nWrite ONE WORD ONLY from the passage for each answer.",
        "headingsList": [],
        "featuresList": [],
        "questions": [
            {"id": 8, "text": "Hokusai showed interest in drawing at the age of five and may have been the son of a {INPUT}."},
            {"id": 9, "text": "As a teenager, he was apprenticed to a wood-block engraver, and later studied under the Ukiyo-e master Shunsho, producing actor prints of the {INPUT}."},
            {"id": 10, "text": "During his career, Hokusai created a wide variety of works, including landscapes, actor prints, and {INPUT} produced for special occasions."},
            {"id": 11, "text": "He also published sketchbooks for amateur artists known as Hokusai {INPUT}."},
            {"id": 12, "text": "In many of his landscape works, he experimented with Western-style colouring and {INPUT} for a time."},
            {"id": 13, "text": "Although he worked in different genres, Hokusai also competed with other masters such as {INPUT}, who was famous for figure prints."}
        ]
    }
]

p2_sections = [
    {
        "type": "ynng",
        "typeName": "Yes/No/Not Given",
        "title": "Questions 14-18",
        "instruction": "Questions 14-18<br><br>Do the following statements agree with the claims of the writer in Reading Passage 2?<br><br>In boxes 14-18 on your answer sheet, write:<br><br><strong>YES</strong> if the statement agrees with the claims of the writer<br><strong>NO</strong> if the statement contradicts the claims of the writer<br><strong>NOT GIVEN</strong> if it is impossible to say what the writer thinks about this",
        "headingsList": [],
        "featuresList": [],
        "questions": [
            {"id": 14, "text": "As expected, the artworks chosen for the exhibition reflect a narrow interpretation of landscape."},
            {"id": 15, "text": "The Academy rejected Australian suggestions for the subject of the exhibition."},
            {"id": 16, "text": "The colonial relationship meant that early Australian landscape painting followed the traditions of English landscape painting."},
            {"id": 17, "text": "The exhibition reflects the fact that Australian art developed its own particular qualities."},
            {"id": 18, "text": "Contemporary Australian artists have generally rejected British landscape traditions."}
        ]
    },
    {
        "type": "mcq",
        "typeName": "Multiple Choice",
        "title": "Questions 19-23",
        "instruction": "Questions 19-23<br><br>Choose the correct letter, <strong>A, B, C or D</strong>.<br><br>Write the correct letter in boxes 19-23 on your answer sheet.",
        "headingsList": [],
        "featuresList": [],
        "questions": [
            {"id": 19, "text": "What is the writer's main point in the second paragraph?", "options": ["A Australian landscape painting derives from the British tradition.", "B Australian landscape painting is more highly regarded than British.", "C Britain is still imposing its principles on Australian art.", "D British art cannot be compared to Australian art."]},
            {"id": 20, "text": "What does Joanna Mendelssohn find surprising?", "options": ["A Modern Australian landscape painting has great variety.", "B The guidelines for the choice of work were very traditional.", "C Landscape painting remains a popular subject for British artists.", "D The British find the Australian landscape unsuitable as a subject."]},
            {"id": 21, "text": "Shaun Gladwell's work is included in the exhibition because", "options": ["A it adopts a subjective approach to depicting the landscape.", "B skateboarding is an inspiration to many Australian artists.", "C storms are a significant feature in the Australian landscape.", "D Bondi is an iconic Australian location."]},
            {"id": 22, "text": "What was the reason for Soriano including Aboriginal art in the exhibition?", "options": ["A It is not well known in London art circles.", "B Aboriginal landscape painting influenced Australian settlers.", "C It is part of the Australian art tradition and not independent of it.", "D Modern Aboriginal painting deals with changes to the landscape."]},
            {"id": 23, "text": "By referring to China, Mendelssohn is making the point that", "options": ["A having an exhibition in London is not as important as it used to be.", "B young artists in Britain are not interested in Australian art.", "C art from Shanghai is more important than Australian art.", "D New York is still a preferred destination for young artists."]}
        ]
    },
    {
        "type": "matching-sentence-endings",
        "typeName": "Matching Sentence Endings",
        "title": "Questions 24-27",
        "instruction": "Questions 24-27<br><br>Complete each sentence with the correct ending, <strong>A-F</strong>, below.<br><br>Write the correct letter, <strong>A-F</strong>, in boxes 24-27 on your answer sheet.",
        "headingsList": [],
        "featuresList": [
            "A reflects the mood created by the natural environment.",
            "B demonstrates that the dominant art form in Australia is landscape painting.",
            "C demonstrates an understanding of the historical importance of the land.",
            "D showcases a very small number of artists.",
            "E demonstrates a strong European flavour.",
            "F shows an acceptance of the unique qualities of Australian art."
        ],
        "questions": [
            {"id": 24, "text": "In spite of its conservatism, the Royal Academy exhibition ..."},
            {"id": 25, "text": "Australian art of the early to mid-1800s ..."},
            {"id": 26, "text": "The modern work by Gladwell chosen for the exhibition ..."},
            {"id": 27, "text": "Including Aboriginal art in the exhibition ..."}
        ]
    }
]

p3_sections = [
    {
        "type": "mcq",
        "typeName": "Multiple Choice",
        "title": "Questions 28-32",
        "instruction": "Questions 28-32<br><br>Choose the correct answer.",
        "headingsList": [],
        "featuresList": [],
        "questions": [
            {"id": 28, "text": "In the opinion of the writer, the biographers Balfour and Crouch", "options": ["understated the role played by Stevenson's family", "misunderstood Stevenson's religious beliefs", "overestimated other writers' influence on Stevenson", "elevated Stevenson above his true status as a writer"]},
            {"id": 29, "text": "What point does the writer make about Stevenson in the second paragraph?", "options": ["The public judged him more fairly than the critics.", "Recent criticism of him has been justified.", "Critics argued that his style covered up his faults.", "The ethical nature of his stories was often criticized."]},
            {"id": 30, "text": "According to the writer, the adventure story", "options": ["is more appropriate for books than films.", "can be used by writers to tell moral stories.", "is more fashionable today than in the past.", "has been used by other writers but not Stevenson."]},
            {"id": 31, "text": "What point does the writer make about Stevenson and Scotland?", "options": ["His ideas contrasted with those of many Scots.", "He demonstrated great sympathy for Scotland's problems.", "He was not considered a true Scot as he was not born there.", "His unflattering stories about Scotland angered many Scots."]},
            {"id": 32, "text": "According to the writer, Stevenson's own lifestyle", "options": ["was envied by his friends.", "was responsible for his early death.", "attracted more attention than his books.", "did not prepare him for living in Samoa."]}
        ]
    },
    {
        "type": "ynng",
        "typeName": "Yes/No/Not Given",
        "title": "Questions 33-36",
        "instruction": "Questions 33-36<br><br>Choose YES if the statement agrees with the claims of the writer, choose NO if the statement contradicts the claims of the writer, or NOT GIVEN if it is impossible to say what the writer thinks about this.",
        "headingsList": [],
        "featuresList": [],
        "questions": [
            {"id": 33, "text": "Although Oscar Wilde admired Stevenson's work, he believed Stevenson could have written something better."},
            {"id": 34, "text": "Stevenson encouraged Oscar Wilde to start writing."},
            {"id": 35, "text": "Galsworthy had greater respect for Hardy than Stevenson."},
            {"id": 36, "text": "More research is needed regarding Stevenson's influence on Chesterton."}
        ]
    },
    {
        "type": "list-selection",
        "typeName": "Summary Completion (List)",
        "title": "Questions 37-41",
        "instruction": "Questions 37-41<br><br>Complete the summary using the list of words, <strong>A-I</strong>, below.",
        "boxTitle": "Word Bank",
        "headingsList": [],
        "featuresList": [
            "A natural ability",
            "B critical acclaim",
            "C humour",
            "D romance",
            "E colorful language",
            "F technical control",
            "G story telling",
            "H depth",
            "I human nature"
        ],
        "questions": [
            {"id": 37, "text": "Opinions differ as to whether Robert Louis Stevenson or Sir Walter Scott should be considered Scotland's best writer. Scott had greater {INPUT}."},
            {"id": 38, "text": "Stevenson had more {INPUT}."},
            {"id": 39, "text": "Scott's books showed more {INPUT} when it came to tragedy though in an old-fashioned way."},
            {"id": 40, "text": "Stevenson's books are still popular because of his {INPUT}."},
            {"id": 41, "text": "Stevenson's understanding of {INPUT} has resulted in the widespread use of an expression from one of his books."}
        ]
    }
]

correct_answers = {
    "q1": ["TRUE"],
    "q2": ["FALSE"],
    "q3": ["TRUE"],
    "q4": ["FALSE"],
    "q5": ["FALSE"],
    "q6": ["TRUE"],
    "q7": ["TRUE"],
    "q8": ["concubine"],
    "q9": ["Kabuki", "kabuki"],
    "q10": ["surimono"],
    "q11": ["manga"],
    "q12": ["perspective"],
    "q13": ["Utamaro", "utamaro"],

    "q14": ["NO"],
    "q15": ["NOT GIVEN"],
    "q16": ["YES"],
    "q17": ["YES"],
    "q18": ["NO"],
    "q19": ["C"],
    "q20": ["B"],
    "q21": ["A"],
    "q22": ["C"],
    "q23": ["A"],
    "q24": ["F"],
    "q25": ["E"],
    "q26": ["A"],
    "q27": ["C"],

    "q28": ["D"],
    "q29": ["C"],
    "q30": ["B"],
    "q31": ["A"],
    "q32": ["C"],
    "q33": ["YES"],
    "q34": ["NOT GIVEN"],
    "q35": ["NO"],
    "q36": ["YES"],
    "q37": ["technical control"],
    "q38": ["natural ability"],
    "q39": ["depth"],
    "q40": ["story telling", "storytelling"],
    "q41": ["human nature"],
}

passages = [
    {
        "id": 1,
        "title": "Katsushika Hokusai",
        "shortName": "Katsushika Hokusai",
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
        "title": "200 Years of Australian Landscapes at the Royal Academy in London",
        "shortName": "200 years of Australian landscapes",
        "difficulty": "Medium",
        "questionRange": "14-27",
        "timeRecommended": 20,
        "passageHeader": {
            "title": "READING PASSAGE 2",
            "instruction": "You should spend about 20 minutes on <strong>Questions 14-27</strong>, which are based on Reading Passage 2 below."
        },
        "passage": passage2_text,
        "questionSections": p2_sections,
        "correctAnswers": {k: v for k, v in correct_answers.items() if 14 <= int(k[1:]) <= 27},
        "explanations": {}
    },
    {
        "id": 3,
        "title": "Robert Louis Stevenson",
        "shortName": "Robert Louis Stevenson",
        "difficulty": "Hard",
        "questionRange": "28-41",
        "timeRecommended": 20,
        "passageHeader": {
            "title": "READING PASSAGE 3",
            "instruction": "You should spend about 20 minutes on <strong>Questions 28-41</strong>, which are based on Reading Passage 3 below."
        },
        "passage": passage3_text,
        "questionSections": p3_sections,
        "correctAnswers": {k: v for k, v in correct_answers.items() if 28 <= int(k[1:]) <= 41},
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
        "totalQuestions": 41,
        "totalTime": 60,
        "passages": 3
    },
    "passages": passages
}

js = "// IELTS Reading Test 42 - Generated 04/02/2026\n" \
     "// Passage 1: Katsushika Hokusai | Passage 2: 200 Years of Australian Landscapes | Passage 3: Robert Louis Stevenson\n\n" \
     "window.IELTS_READING_TEST = " + json.dumps(final_data, ensure_ascii=False, indent=4) + ";\n"

out = r"questions IELTS R\ielts-reading-test-42.js"
with open(out, "w", encoding="utf-8") as f:
    f.write(js)

print(f"Done: {out}")
