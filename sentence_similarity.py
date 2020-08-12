import numpy as np
import pprint

import html2text
import requests

from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from spacy.lang.en import English  # updated
from transformers import DistilBertTokenizer, TFDistilBertModel

# ARTICLE = """
# On Wednesday, the US Justice Department asked a federal judge to block California’s pivotal net neutrality law, according to Reuters.
#
# In 2017, the Trump Federal Communications Commission voted to repeal the Obama-era internet regulations that barred internet service providers from throttling or blocking traffic and instituting paid fast lanes. In August 2018, California passed its own law upholding those net neutrality principles at the state level; now, the US government is seeking a preliminary injunction to block the law before the state is able to enforce it.
#
# The Department of Justice filed suit against California soon after the law was passed, but the case was put on hold as legal challenges to the initial FCC order were adjudicated. With this latest request, the Justice Department is seeking to suspend implementation of the California law as the case proceeds.
#
# The California law won its first challenge last year. After the FCC reversed its net neutrality rules in 2017, the agency’s decision was challenged in court by a coalition of organizations including Mozilla. The petitioners argued that the FCC’s decision was unlawful, founded on poor analysis of the internet service market, and would harm public safety. California agreed not to enforce its own law before the courts ruled on this case because the FCC had included language in its reversal that would preempt states from rolling out their own net neutrality rules.
#
# In October 2019, the FCC’s reversal was mostly upheld, but the District of Columbia Court of Appeals ruled that the FCC did not have the legal authority to prohibit states from passing their own net neutrality regulations. According to Reuters, the Justice Department believes that the FCC’s ruling preempts state laws like California’s.
#
# The California attorney general’s office did not immediately respond to a request for comment from The Verge but told Reuters that the office was reviewing the Justice Department’s filing.
#
# A decision on the Justice Department’s filing isn’t expected until at least mid-October.
# """

ARTICLE = """
Services that sell to HOAs
This is something I've been thinking about since my HOA sent me an email a month ago warning me that the sidewalk outside my property may be damaged and in need of repair because if someone tripped I'd be liable for this. Of course the email had a bunch of red and gold text.

Luckily for me they already had a concrete cutting company come by and survey the area and provide estimates for each plot.

My bill would be about $200 to fix the sidewalk. I looked outside and it was totally level and no edges exposed.

In really small print at the bottom of the email was information telling me it was optional to do, but again I might be liable if anything happens.

Today I saw this person outside doing the concrete repairs. It was a guy with a small trailer and grinding down the sidewalk with an angle grinder and a vacuum to suck up the dust.

This basic concrete cutting job is pulling money in if he can go around and tell all the HOAs about the urgent need to fix sidewalks and HOAs pass that along to all the residents.

How many people paid the $200 "to be on the safe side"?

Now you repeat for all the other services you can think about for home maintenance and repair and contact HOAs with estimates they can pass along.

"""

sentencizer = English()
sentencizer.add_pipe(sentencizer.create_pipe("sentencizer"))  # updated

model = SentenceTransformer("bert-base-nli-mean-tokens")


def split_into_sentences(article):
    """
    Given a long string, return a long list of sentences.
    """
    doc = sentencizer(article)
    sentences = [sent.string.strip() for sent in doc.sents]
    return [s for s in sentences if len(s) > 0]


def bert_embedding(sentence):
    """
    Given a long string, return a long list of sentences.
    """
    tokenizer = DistilBertTokenizer.from_pretrained("distilbert-base-uncased")
    model = TFDistilBertModel.from_pretrained("distilbert-base-uncased")
    inputs = tokenizer(sentence, return_tensors="tf")
    outputs = model(inputs)
    return outputs[0][0, 0, :].numpy()


def sentence_transformer_embedding(sentence):
    return model.encode(sentence)


def print_most_similar(article):
    sentences = split_into_sentences(article)
    embeddings = model.encode(sentences)
    similarity = cosine_similarity(embeddings, embeddings)
    # Zero out the diagonal so we can calculate this max.
    similarity *= 1 - np.identity(len(sentences))

    print("")
    for idx, sentence in enumerate(sentences):
        print(sentence)
        most_similar = np.argmax(similarity[idx, :])
        print(sentences[most_similar])
        print("Similarity: ", similarity[idx, most_similar])
        print("")


def query_similarity(article, filter_under_character_length=75):
    sentences = split_into_sentences(article)
    print("Number sentences: {}".format(len(sentences)))
    if filter_under_character_length:
        sentences = [s for s in sentences if len(s) > filter_under_character_length]
        print(
            "Number sentences after filtering short sentences: {}".format(
                len(sentences)
            )
        )

    embeddings = model.encode(sentences)
    print(embeddings.shape)

    while True:
        query = input("Sentence: ")
        if query.lower() == "quit":
            return

        query_embedding = sentence_transformer_embedding(query)
        print(query_embedding.shape)
        similarity = cosine_similarity(embeddings, query_embedding)
        maximum = np.argmax(similarity)
        print(
            "Most similar ({}: {}): {}".format(
                maximum, similarity[maximum], sentences[maximum]
            )
        )


if __name__ == "__main__":
    r = requests.get(
        "https://www.nytimes.com/2020/08/06/business/small-businesses-relief-program-ending.html"
    )
    content_type = r.headers.get("content-type")
    assert content_type.startswith("text/html"), content_type

    h = html2text.HTML2Text()
    h.ignore_links = True
    h.ignore_tables = True
    h.ignore_images = True
    h.ignore_emphasis = True
    article = h.handle(r.text)

    print(article)

    query_similarity(article, filter_under_character_length=75)
