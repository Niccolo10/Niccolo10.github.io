---
title: "THS Challenges Writeups - Misc"
description: "Writeups of the challenges of THS  - Misc"
category: Archive
date: 2023-09-10
draft: false
---

> From the archive. This article retains its original publication date; tools and recommendations reflect that period.


<p>Writeups of the challenges of THS  - Misc</p>
<p> </p>
<h2 id="misc">Misc</h2>
<h2 id="embark-on-a-cookie-quest">Embark on a Cookie Quest!</h2>
<p>Indulging in the delightful world of internet browsing, one can’t deny the joy that comes from the delectable cookies on every website. And now, we’ve crafted a special realm just for you to amass a multitude of these cookies. Can you gather them all before they lose their freshness?</p>
<figure><img alt="the 'dirty' spot" src="/images/cookei1.png" width="900"/>
</figure>
<figure><img alt="the 'dirty' spot" src="/images/cookie2.png" width="900"/>
</figure>
<figure><img alt="the 'dirty' spot" src="/images/cookie3.png" width="900"/>
</figure>
<p>Seems like we need to be faster in order not to let the cookie espire.</p>
<div class="highlight"><pre tabindex="0"><code class="language-python" data-lang="python"><span>import</span> requests

url <span>=</span> <span>'http://ths.eemcs.utwente.nl:33109/'</span>

cookies <span>=</span> {<span>'password'</span>: <span>'I_LOVE_COOKIES&lt;3'</span>}
response <span>=</span> requests<span>.</span>get(url<span>+</span><span>'/cookie'</span>, cookies<span>=</span>cookies)

password <span>=</span> str(response<span>.</span>content)[<span>1044</span>:<span>1069</span>]

<span>while</span> (<span>True</span>):
    cookies <span>=</span> {<span>'password'</span>: password}
    response <span>=</span> requests<span>.</span>get(url<span>+</span><span>'/cookie'</span>, cookies<span>=</span>cookies)
    password <span>=</span> str(response<span>.</span>content)[<span>1044</span>:<span>1069</span>]
    <span>if</span> password[:<span>4</span>] <span>==</span> <span>'THS{'</span>:
        <span>break</span>

print(<span>'Flag:'</span>, password)
</code></pre></div>

<p>🚀 <strong>Flag Retrieval</strong></p>
<p>These are the passage to retrieve the flag:</p>
<ol>
<li>
<p><strong>Preparation</strong>:
We arm ourselves with a special cookie, confessing our love for cookies.</p>
</li>
<li>
<p><strong>Initial Expedition</strong>:
We make our first move, sending a daring GET request to the web address, equipped with our cookie.</p>
</li>
<li>
<p><strong>Decrypting Clues</strong>:
The response received holds hidden clues, and we diligently extract a series of characters, hoping to uncover the password.</p>
</li>
<li>
<p><strong>Cracking the Code</strong>:
With the extracted characters in hand, we craft a loop to continuously test new cookies. Each attempt propels us closer to the coveted flag.</p>
</li>
<li>
<p><strong>Victory Revealed</strong>:
After numerous trials, we triumphantly unveil the flag.</p>
</li>
</ol>
<h2 id="nyte-encodings">Nyte Encodings</h2>
<p>The conventional byte consists of 8 bits, chosen primarily because it is a power of 2. However, for this challenge, we’re embracing a different approach - the 9-bit byte, aptly named the <code>nyte</code>. We believe it’s much cooler! The string provided below is a hexadecimal encoding of our flag represented as ASCII characters in <code>nytes</code>. Can you decipher the flag?</p>
<h3 id="encoded-flag">Encoded Flag</h3>
<p>The following string represents the flag in hexadecimal encoding:</p>
<div class="highlight"><pre tabindex="0"><code class="language-plaintext" data-lang="plaintext">2a120a67b371e4e8653997cc2723297cc4332a15066722f9d0d0403717cc4793a194e67d
</code></pre></div>

<h3 id="python-code-for-decoding">Python Code for Decoding</h3>
<p>Here’s a Python script that will guide you in decoding the flag from the given hexadecimal string:</p>
<div class="highlight"><pre tabindex="0"><code class="language-python" data-lang="python">flag <span>=</span> <span>''</span>

<span># Provided hexadecimal string</span>
hexadecimal <span>=</span> <span>'2a120a67b371e4e8653997cc2723297cc4332a15066722f9d0d0403717cc4793a194e67d'</span>
print(<span>'hex:'</span>, hexadecimal)

<span># Transform it into decimal</span>
decimal <span>=</span> int(hexadecimal, <span>16</span>)
print(<span>'decimal:'</span>, decimal)

<span># Transform it into binary</span>
binary <span>=</span> bin(decimal)
print(<span>'binary:'</span>, binary)

<span># Split it into chunks of 9 (instead of 8)</span>
sequence <span>=</span> <span>0</span>
<span>for</span> i <span>in</span> range(len(binary)<span>//</span><span>9</span>):
    flag <span>+=</span> chr(int(binary[sequence:sequence<span>+</span><span>9</span>], <span>2</span>))
    sequence <span>+=</span> <span>9</span>
print(<span>'Decoded Flag:'</span>, flag)
</code></pre></div>

<p>The challenge lies in the unconventional use of a 9-bit byte (nyte), deviating from the standard 8-bit byte, making the flag decoding process more intricate. Feel free to explore and use this Python script to retrieve the flag from the given hexadecimal encoding.</p>
<p> </p>
<p> </p>
<h2 id="whistleblower">WhistleBlower</h2>
<p>Alice stumbled upon the identity of the whistleblower in her company while going through some files. She needed to inform Eve but was cautious about her communications being monitored. To conceal the message, she hid it within a seemingly innocent email. Can you uncover who betrayed the company?</p>
<h3 id="challenge-description">Challenge Description</h3>
<p>Alice found a suspiciously formatted email and suspected that it contained a hidden message. The content of the file is provided below:</p>
<div class="highlight"><pre tabindex="0"><code class="language-plaintext" data-lang="plaintext">Dear Eve,       	
 	 	 	  
Thank you for your email informing me of your absence. I hope you feel better soon. Do not worry about your presentation with the Stegno Space Ltd. I can cover for you. Could you please send me your notes for that. 	  	   
 	 	  		
Thank you, 				 		
Best, 	    	 
Alice  		    
 		   	 
 	 					
  		   	
 			  		
 	 					
  		   	
 	  	   
  		  		
 	 					
 			 			
  		   	
 			  		
  		 			
 	  		  
  		  		
 	 					
 	    	 
 		 		  
  		    
 			 			
  		  		
 			  	 
 					 	
</code></pre></div>

<h3 id="analysis-and-decoding">Analysis and Decoding</h3>
<p>Upon analyzing the file, Alice noticed unusual spaces and tabs at the end of the email. She suspected that a secret message was hidden there.</p>
<div class="highlight"><pre tabindex="0"><code class="language-bash" data-lang="bash">cat -T Dear_Eve.txt
</code></pre></div>

<p>Alice used this command to visualize tabs and spaces in the file:</p>
<p>Dear Eve,       ^I
^I ^I ^I<br/>
… (output truncated for brevity)</p>
<p>She then mapped each tab and space to binary (0s and 1s) and decoded them, using space as the delimiter and employing different byte lengths. Through this decoding, Alice found what seemed to be a piece of the flag.</p>
<h3 id="decoding-results">Decoding Results</h3>
<p>Decoding using 7 as byte length:</p>
<pre tabindex="0"><code>input: 1100010 1011111 0110001 1110011 1011111 0110001 1001000 0110011 1011111 1110111 0110001 1110011 0110111 1001100 0110011 1011111 1000010 1101100 0110000 1110111 0110011 1110010 1111101
output: b_1s_1H3_w1s7L3_Bl0w3r}
</code></pre><p>Decoding using 8 byte lenght:</p>
<pre tabindex="0"><code>input: 00000001 01010100 01001000 01010011 01111011 01000010 00110000
output: THS{B0
</code></pre><p>Alice retrieved the flag by concatenating the decoded strings:</p>
<pre tabindex="0"><code>THS{B0b_1s_1H3_w1s7L3_Bl0w3r}
</code></pre><p>The challenge lies in decoding the hidden message concealed within the formatting of the email, providing a glimpse into the identity of the whistleblower.</p>
<p>For an easier solve i wrote this code :</p>
<div class="highlight"><pre tabindex="0"><code class="language-python" data-lang="python">s <span>=</span> <span>'''^I ^I ^I  
</span><span>^I  ^I   
</span><span>^I ^I  ^I^I
</span><span>^I^I^I^I ^I^I
</span><span>^I    ^I 
</span><span>^I^I    
</span><span>^I^I   ^I 
</span><span>^I ^I^I^I^I^I
</span><span> ^I^I   ^I
</span><span>^I^I^I  ^I^I
</span><span>^I ^I^I^I^I^I
</span><span> ^I^I   ^I
</span><span>^I  ^I   
</span><span> ^I^I  ^I^I
</span><span>^I ^I^I^I^I^I
</span><span>^I^I^I ^I^I^I
</span><span> ^I^I   ^I
</span><span>^I^I^I  ^I^I
</span><span> ^I^I ^I^I^I
</span><span>^I  ^I^I  
</span><span> ^I^I  ^I^I
</span><span>^I ^I^I^I^I^I
</span><span>^I    ^I 
</span><span>^I^I ^I^I  
</span><span> ^I^I    
</span><span>^I^I^I ^I^I^I
</span><span> ^I^I  ^I^I
</span><span>^I^I^I  ^I 
</span><span>^I^I^I^I^I ^I'''</span>

l <span>=</span> s<span>.</span>split(<span>'</span><span>\n</span><span>'</span>)

<span>for</span> sol <span>in</span> l:
    sol <span>=</span> sol<span>.</span>replace(<span>'^I'</span>, <span>'1'</span>)
    sol <span>=</span> sol<span>.</span>replace(<span>' '</span>, <span>'0'</span>)
    print(chr(int(sol, <span>2</span>)), end<span>=</span><span>''</span>)
</code></pre></div>

<p> </p>
<p> </p>
<h2 id="ford-automotive-challenge">Ford Automotive Challenge</h2>
<p>An American car manufacturer maintains a database containing the mileage of their sold vehicles, ranging from <code>0</code> to <code>10,000,000</code>. Ben, a new employee, has devised an algorithm to detect fake or anomalous mileage entries in this database. To showcase the effectiveness of his algorithm, he’s willing to provide the flag to anyone who can submit 1,000 automatically generated mileage values that pass his anomaly check.</p>
<h3 id="challenge-details">Challenge Details</h3>
<p>The server expects data in the form of a JSON list containing 1,000 mileage values:</p>
<div class="highlight"><pre tabindex="0"><code class="language-python" data-lang="python"><span># Import requests</span>
<span>import</span> requests

<span># Send message to server to retrieve response</span>
response <span>=</span> requests<span>.</span>post(
    <span>"http://ths.eemcs.utwente.nl:&lt;docker_port&gt;/"</span>,
    json<span>=</span>{<span>'mileage'</span>: [<span>&lt;</span>integer_value_1<span>&gt;</span>, <span>...</span>, <span>&lt;</span>integer_value_1000<span>&gt;</span>]},
)

<span># Get response from JSON format</span>
print(response<span>.</span>json())
</code></pre></div>

<h3 id="data-collection-and-submission">Data Collection and Submission</h3>
<p>To generate the 1,000 mileage values and submit them for the challenge, the provided Python script utilizes a dataset of cars for sale. The script extracts the mileage values from the dataset and sends them via a POST request to the server endpoint.</p>
<div class="highlight"><pre tabindex="0"><code class="language-python" data-lang="python"><span>import</span> requests

<span># Sample dataset of cars with mileage information</span>
data <span>=</span> <span>"""
</span><span>Fiesta,2017,12000,Automatic,15944,Petrol,150,57.7,1.0
</span><span>Focus,2018,14000,Manual,9083,Petrol,150,57.7,1.0
</span><span>... (data truncated for brevity) ...
</span><span>"""</span>

<span># Split data into lines</span>
lines <span>=</span> data<span>.</span>split(<span>'</span><span>\n</span><span>'</span>)

<span># Extract mileage values from the dataset</span>
mileage_values <span>=</span> []
<span>for</span> line <span>in</span> lines:
    parts <span>=</span> line<span>.</span>split(<span>','</span>)
    mileage <span>=</span> int(parts[<span>4</span>])
    mileage_values<span>.</span>append(mileage)

<span># Send the mileage values via a POST request</span>
response <span>=</span> requests<span>.</span>post(
    <span>"http://ths.eemcs.utwente.nl:33115"</span>,
    json<span>=</span>{<span>'mileage'</span>: mileage_values}
)

<span># Print the response in JSON format</span>
print(response<span>.</span>json())
</code></pre></div>

<h3 id="challenge-resolution">Challenge Resolution</h3>
<p>The provided Python script processes the dataset to obtain mileage values and sends them to the specified server. Upon submission, the server checks for anomalous mileage numbers based on Ben’s algorithm. If 1,000 valid mileage values are submitted, the server will respond with the flag.</p>

