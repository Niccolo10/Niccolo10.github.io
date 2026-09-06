---
title: "Kruskal Algorithm"
description: "Theoretical report on connected components and kruskal algorithm, with tests and related analysis."
category: Archive
date: 2021-09-08
draft: false
---

> From the archive. This article retains its original publication date; tools and recommendations reflect that period.


<p>Theoretical report on connected components and kruskal algorithm, with tests and related analysis.</p>
<h2 id="project">Project</h2>
<p>The aim of this exercise is to find and evaluate the number of connected components using the Kruskal algorithm. The Kruskal algorithm is a widely used algorithm in graph theory for finding the minimum spanning tree of a connected weighted graph.</p>
<p>To begin, we start by generating a random graph with a user-specified number of nodes. Each node in the graph represents a vertex, and we determine the probability of arcs (edges) between vertices. The probability can range from 0 to 1, allowing us to control the density of connections in the graph.</p>
<p>After generating the random graph, we randomly assign weights to each arc. These weights represent the cost or distance associated with traversing the edge between two vertices. The weights can be assigned according to various criteria, such as a uniform distribution or specific weight ranges.</p>
<p>Next, we employ the Kruskal algorithm, utilizing the efficient union-find data structure. The algorithm operates by iteratively selecting the edges with the lowest weights while ensuring that no cycles are formed. By connecting the vertices through these selected edges, we construct a minimum spanning tree, which spans all the nodes in the graph while minimizing the total weight.</p>
<div class="highlight"><pre tabindex="0"><code class="language-python" data-lang="python"><span>def</span> <span>Kruskal_algo</span>(self, S, dictionary):
    result <span>=</span> []
    n <span>=</span> <span>0</span>
    <span>for</span> node <span>in</span> self<span>.</span>nodes:
        self<span>.</span>makeSet(node, S)
    sortedArchs <span>=</span> {k: node <span>for</span> k, node <span>in</span> sorted(dictionary<span>.</span>items(), key<span>=</span><span>lambda</span> item: item[<span>1</span>])}
    <span>for</span> i <span>in</span> sortedArchs:
        <span>if</span> self<span>.</span>find(i[<span>0</span>], S) <span>!=</span> self<span>.</span>find(i[<span>1</span>], S):
            result<span>.</span>append(i)
            self<span>.</span>union(i[<span>0</span>], i[<span>1</span>], S)
            n <span>=</span> n <span>+</span> <span>1</span>
            <span>if</span> n <span>==</span> len(self<span>.</span>nodes) <span>-</span> <span>1</span>:
                <span>break</span>
    <span>return</span> result</code></pre></div>
<p>Once we have constructed the minimum spanning tree using the Kruskal algorithm, we can determine the number of connected components in the original graph. Connected components are subsets of vertices within the graph where each vertex is connected to at least one other vertex in the subset. The number of connected components reflects the level of connectivity and can provide insights into the graph’s structure.</p>
<p>To evaluate the performance and behavior of the algorithm, we conduct several tests with different numbers of nodes in the graph. In particular, we choose to run the tests with <strong>5, 50, and 500 nodes</strong> to observe how the algorithm scales with varying graph sizes. By analyzing the results, we can gain a better understanding of the algorithm’s efficiency, scalability, and ability to accurately identify connected components.</p>
<p>This exercise provides a hands-on opportunity to explore graph algorithms, specifically the Kruskal algorithm, and understand its practical applications in solving connectivity-related problems. The implementation and analysis of the algorithm on graphs of different sizes offer valuable insights into its performance characteristics and its potential use in various real-world scenarios.</p>
<p>You can find my full project on this <a href="https://github.com/Niccolo10/Kruskal_Algorithm">Github Repository</a>.</p>

