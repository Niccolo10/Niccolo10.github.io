---
title: "Edit distance with and without N-grams"
description: "This project implements the Edit Distance algorithm with and without N-Gram support, providing a versatile tool for string similarity and comparison tasks in various domains."
category: Archive
date: 2021-09-05
draft: false
---

> From the archive. This article retains its original publication date; tools and recommendations reflect that period.


<p>This project implements the Edit Distance algorithm with and without N-Gram support, providing a versatile tool for string similarity and comparison tasks in various domains.</p>
<p>This project implements the Edit Distance algorithm with and without N-Gram support. The Edit Distance algorithm calculates the minimum number of operations required to transform one string into another. It is useful for tasks like spell checking, DNA sequence analysis, and natural language processing.</p>
<p>The implementation consists of two main parts: the Edit Distance algorithm itself and the N-Gram support.</p>
<div class="highlight"><pre tabindex="0"><code class="language-python" data-lang="python"><span># Code snippet for the edit_distance function</span>
<span>def</span> <span>edit_distance</span>(string1, string2):
    <span># Implementation of the edit distance algorithm</span>
    <span># ...</span>
    <span>return</span> distance</code></pre></div>
<p>In addition to the basic Edit Distance algorithm, this project also incorporates N-Gram support. N-Grams are contiguous subsequences of characters or words in a given input string. They are used to enhance the Edit Distance algorithm by considering the similarity between two strings based on their shared N-Grams.</p>
<div class="highlight"><pre tabindex="0"><code class="language-python" data-lang="python"><span># Code snippet for the nGramCreator function</span>
<span>def</span> <span>nGramCreator</span>(input_string, n):
    <span># Implementation of the N-Gram generation</span>
    <span># ...</span>
    <span>return</span> ngrams</code></pre></div>
<p>The Jaccard function computes the Jaccard similarity between two sets of N-Grams. This similarity measure helps in determining the similarity between two strings based on their N-Grams.</p>
<p>The project includes test functions to evaluate the performance of the Edit Distance algorithm with and without N-Gram support. For example, the TestEditDistance function tests the algorithm on a dictionary of Italian words and finds the word with the minimum edit distance from the input word.</p>
<div class="highlight"><pre tabindex="0"><code class="language-python" data-lang="python"><span># Code snippet for the TestEditDistance function</span>
<span>def</span> <span>TestEditDistance</span>(input_word, dictionary):
    <span># Test function to find the word with minimum edit distance</span>
    <span># ...</span>
    <span>return</span> result</code></pre></div>
<p>The project also includes various test cases to evaluate the algorithm’s performance in different scenarios, such as testing on words with added characters, removed characters, and swapped characters.</p>
<p>The project generates graphs to visualize the performance of the Edit Distance algorithm with and without N-Gram support. These graphs provide insights into the efficiency of the algorithms in different scenarios.</p>
<p>You can find my full project on this <a href="https://github.com/Niccolo10/N-GramEditDistance">Github Repository</a>.</p>

