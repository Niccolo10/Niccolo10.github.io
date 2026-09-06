---
title: "Dante CTF Writeups - Forensics"
description: "Writeups of the Dante CTF 2023 - Forensics"
category: Archive
date: 2023-06-05
draft: false
---

> From the archive. This article retains its original publication date; tools and recommendations reflect that period.


<p>Writeups of the Dante CTF 2023 - Forensics</p>
<p> </p>
<h2 id="forensics">FORENSICS</h2>
<h2 id="dirty-checkerboard">Dirty Checkerboard</h2>
<p>🏆 Challenge Description</p>
<p><em>I bought a new chessboard but every time I use it I have this feeling… Like it’s dirty or something.</em></p>
<hr/>
<p>The attached image indeed had a square of “dirt” in the lower left corner of the square with coordinates B2:</p>
<p><img alt="the “dirty” spot" src="/images/DirtyCheckboard.png"/></p>
<p>Since the image was grayscale, those “digital” pixels in an “analogue” picture could be easily decoded as 1-byte values with a couple of lines of code:</p>
<div class="highlight"><pre tabindex="0"><code class="language-python" data-lang="python"><span>from</span> PIL <span>import</span> Image

offset <span>=</span> (<span>359</span>, <span>2031</span>)

img <span>=</span> Image<span>.</span>open(<span>"DirtyCheckerboard.bmp"</span>)
<span>for</span> w <span>in</span> range(<span>0</span>, <span>15</span>):
    <span>for</span> h <span>in</span> range(<span>0</span>, <span>10</span>):
        coords <span>=</span> (offset[<span>0</span>] <span>+</span> w, offset[<span>1</span>] <span>+</span> h)
        print(chr(img<span>.</span>getpixel(coords)), end<span>=</span><span>""</span>)
</code></pre></div>

<p>🏁 DANTE{ch3ck_0ut_abmagick}
 </p>
<p> </p>
<h2 id="do-you-know-gif">Do You Know GIF?</h2>
<p>🏆 Challenge Description</p>
<p><em>Ah, Dante! He appears in poems, videogames… He wrote about a lot of people but few have something meaningful to say about him nowadays.</em></p>
<hr/>
<p>Here you have two options:</p>
<ol>
<li>Hope in a reverse image search, find the original GIF, and compare the hexdump of the two.</li>
<li>Use strings<code>or the more sophisticated</code>exiftool`.</li>
</ol>
<p>The easiest way for me to solve it is to use <code>exiftool</code> :</p>
<div class="highlight"><pre tabindex="0"><code class="language-bash" data-lang="bash">$ exiftool -a dante.gif | grep Comment

Comment: Hey look, a comment!
Comment: These comments sure <span>do</span> look useful
Comment: I wonder what <span>else</span> I could <span>do</span> with them?
Comment: 44414e54457b673166355f --&amp;gt; DANTE<span>{</span>g1f5_
Comment: 3472335f6d3464335f6279 --&amp;gt; 4r3_m4d3_by
Comment: 5f626c30636b357d --&amp;gt; _bl0ck5<span>}</span>
Comment: At the edges of the map lies the void
</code></pre></div>

<p>Decoding those three blocks from hex to ASCII would have given you the flag.<br/>
It’s also possible to complete this challenge using a simple parser:</p>
<div class="highlight"><pre tabindex="0"><code class="language-python" data-lang="python"><span>import</span> re
<span>import</span> binascii

comment_block_marker <span>=</span> <span>b</span><span>'0021fe'</span>  <span># "00" is the end of a previous block and "21 FE" is the start of a comment block</span>

<span>with</span> open(<span>"dante.gif"</span>, <span>"rb"</span>) <span>as</span> f:
    <span># Read the GIF as literal hex (remember that 1 hex byte = 2 ASCII chars here)</span>
    hexdata <span>=</span> binascii<span>.</span>hexlify(f<span>.</span>read())

    <span># Find all comment blocks</span>
    <span>for</span> match <span>in</span> re<span>.</span>finditer(comment_block_marker, hexdata):
        <span># Find the (ASCII hex string) offset of the comment length byte</span>
        length_offset <span>=</span> match<span>.</span>start() <span>+</span> len(comment_block_marker)
        <span># The actual comment starts at the next hex byte (two ASCII chars)</span>
        comment_offset <span>=</span> length_offset <span>+</span> <span>2</span>

        <span># Parse the comment length byte (the next two ASCII chars = 1 hex byte) and double its value since we are reading ASCII offsets, not hex bytes</span>
        comment_length <span>=</span> int(hexdata[length_offset:comment_offset], <span>16</span>) <span>*</span> <span>2</span>

        <span># Extract the comment data itself</span>
        comment <span>=</span> hexdata[comment_offset:comment_offset <span>+</span> comment_length]
        decoded_comment <span>=</span> bytearray<span>.</span>fromhex(comment<span>.</span>decode(<span>"ascii"</span>))<span>.</span>decode()

        <span># If the comment's contents look like hex, decode them again</span>
        <span>if</span> re<span>.</span>match(<span>r</span><span>'^[a-z0-9]+$'</span>, decoded_comment):
            decoded_comment <span>+=</span> <span>f</span><span>" --&amp;gt; </span><span>{</span>bytearray<span>.</span>fromhex(decoded_comment)<span>.</span>decode()<span>}</span><span>"</span>

        <span># Decode and print the comment</span>
        print(<span>f</span><span>'offset </span><span>{</span>match<span>.</span>start()<span>}</span><span> length </span><span>{</span>comment_length<span>}</span><span>:</span><span>\t</span><span>"</span><span>{</span>decoded_comment<span>}</span><span>"'</span>)
</code></pre></div>

<div class="highlight"><pre tabindex="0"><code class="language-plaintext" data-lang="plaintext">offset 337940 length 40:	"Hey look, a comment!"
offset 2672040 length 68:	"These comments sure do look useful"
offset 9736542 length 80:	"I wonder what else I could do with them?"
offset 15786384 length 44:	"44414e54457b673166355f --&amp;gt; DANTE{g1f5_"
offset 17808476 length 44:	"3472335f6d3464335f6279 --&amp;gt; 4r3_m4d3_by"
offset 21718496 length 32:	"5f626c30636b357d --&amp;gt; _bl0ck5}"
offset 26133830 length 74:	"At the edges of the map lies the void"
</code></pre></div>

<p>🏁 <!-- raw HTML omitted -->DANTE{g1f5_4r3_m4d3_by_bl0ck5}<!-- raw HTML omitted --></p>
<p> </p>
<p> </p>
<h2 id="imago-qualitatis">Imago Qualitatis</h2>
<p>🏆 Challenge Description</p>
<p>A wondrous electromagnetic wave was captured by a metal-stick-handed devil.
“But.. What? No, not this way. Maybe, if I turn around like this… Aha!”</p>
<hr/>
<p>If a player dared to download and decompress the ~800MB archive a file named gqrx_20230421_133330_433000000_1800000_fc.raw would have appeared.</p>
<p>The first word in the filename suggested that it had something to do with Gqrx SDR, “an open-source software-defined radio receiver (SDR) powered by the GNU Radio and the Qt graphical toolkit” created by Alexandru Csete (OZ9AEC ham radio callsign). The file was indeed a raw radio signal capture represented as IQ data, a way to store a signal’s characteristics way more accurate than just sampling its amplitude at predefined intervals.</p>
<p>Opening the file in Gqrx and playing it back (here’s a simple tutorial) actually revealed the flag.</p>
<p><img alt="gqrx waterfall showing a portion of the flag" src="/images/gqrx.jpg"/></p>
<p>🏁 <!-- raw HTML omitted -->DANTE{n3w_w4v35_0ld_5ch00l}<!-- raw HTML omitted --></p>
<p> </p>
<p> </p>
<h2 id="who-can-haz-flag">Who Can Haz Flag</h2>
<p>🏆 Challenge Description</p>
<p>A little spirit spied on this mortal transmission. He noticed that the human was after something, but what was it?</p>
<p>Among the TLS-encrypted noise a little less than 30 ARP requests stood out. The peculiar thing about them was that they were all probes/requests for the same CIDR: 102.108.103.0/24. The last octet of the requested address was the only thing that changed between those packets, and decoding it as an ASCII character gave out the characters of the flag.</p>
<p>Here’s an example of an extraction script:</p>
<div class="highlight"><pre tabindex="0"><code class="language-python" data-lang="python"><span>from</span> ipaddress <span>import</span> ip_address, ip_network
<span>from</span> scapy.all <span>import</span> Ether, ARP, rdpcap


<span>def</span> <span>filter_packet</span>(pkt):
    <span>return</span> \
        ARP <span>in</span> pkt <span>and</span> \
        ip_address(pkt[ARP]<span>.</span>pdst) <span>in</span> ip_network(<span>'102.108.103.0/24'</span>)


packets <span>=</span> rdpcap(<span>"WhoCanHazFlag.pcapng"</span>)
arps <span>=</span> [p <span>for</span> p <span>in</span> packets <span>if</span> filter_packet(p)]

flag <span>=</span> []
<span>for</span> pkt <span>in</span> arps:
    ip_dst <span>=</span> pkt[ARP]<span>.</span>pdst
    ip_last_octet <span>=</span> int(ip_dst<span>.</span>split(<span>'.'</span>)[<span>3</span>])
    flag_char <span>=</span> chr(ip_last_octet)
    print(<span>f</span><span>"</span><span>{</span>pkt<span>.</span>summary()<span>}</span><span> ==&amp;gt; </span><span>{</span>ip_dst<span>}</span><span> --&amp;gt; </span><span>{</span>ip_last_octet<span>}</span><span> = '</span><span>{</span>flag_char<span>}</span><span>'"</span>)

    flag<span>.</span>append(flag_char)
print(<span>'</span><span>\n</span><span>'</span> <span>+</span> <span>''</span><span>.</span>join(flag))
</code></pre></div>

<div class="highlight"><pre tabindex="0"><code class="language-plaintext" data-lang="plaintext">
Ether / ARP who has 102.108.103.68 says 255.255.255.0 ==&amp;gt; 102.108.103.68 --&amp;gt; 68 = 'D'
Ether / ARP who has 102.108.103.65 says 255.255.255.0 ==&amp;gt; 102.108.103.65 --&amp;gt; 65 = 'A'
Ether / ARP who has 102.108.103.78 says 255.255.255.0 ==&amp;gt; 102.108.103.78 --&amp;gt; 78 = 'N'
Ether / ARP who has 102.108.103.84 says 255.255.255.0 ==&amp;gt; 102.108.103.84 --&amp;gt; 84 = 'T'
Ether / ARP who has 102.108.103.69 says 255.255.255.0 ==&amp;gt; 102.108.103.69 --&amp;gt; 69 = 'E'
Ether / ARP who has 102.108.103.123 says 255.255.255.0 ==&amp;gt; 102.108.103.123 --&amp;gt; 123 = '{'
[...]
Ether / ARP who has 102.108.103.125 says 255.255.255.0 ==&amp;gt; 102.108.103.125 --&amp;gt; 125 = '}'
</code></pre></div>

<p>🏁 <!-- raw HTML omitted -->DANTE{wh0_h4s_fl4g_ju5t_45k}<!-- raw HTML omitted --></p>
<p> </p>
<p> </p>
<h2 id="routes-mark-the-spot">Routes Mark The Spot</h2>
<p>🏆 Challenge Description</p>
<p>Aha, the little spirit says that the human became more ingenious! What a weird way to transmit something, though.</p>
<hr/>
<p>Like the previous forensics challenge, among the TLS-encrypted noise some widely spaced IPv6 packets stood out. Their payload seemed random or somehow encoded, but, in truth, they all matched the same format: [A-Za-z0-9]{64,128}:FLAG_CHAR:[A-Za-z0-9]{64,128}.</p>
<p>Thus by filtering the packets in that IPv6 “conversation” and extracting the characters between the colons, something that vaguely resembled a flag could be extracted:</p>
<div class="highlight"><pre tabindex="0"><code class="language-plaintext" data-lang="plaintext">n_nD71}n3{_mlmb4_cEysAg54434lN_hnT
</code></pre></div>

<p>The final step was indeed to reorder the packets basing on their flow label field, the only other difference that existed between them. Here’s an example of a an extraction script that does that:</p>
<div class="highlight"><pre tabindex="0"><code class="language-python" data-lang="python"><span>import</span> re
<span>from</span> scapy.all <span>import</span> Ether, IPv6, rdpcap


<span>def</span> <span>filter_packet</span>(pkt):
    <span>return</span> \
        IPv6 <span>in</span> pkt <span>and</span> \
        pkt[IPv6]<span>.</span>src <span>==</span> <span>"526c:54da:4326:f2fa:eb05:8f48:5bd8:e856"</span> <span>and</span> \
        pkt[IPv6]<span>.</span>dst <span>==</span> <span>"7fa1:f44b:d702:3f7a:35db:de1d:1576:2799"</span>


packets <span>=</span> rdpcap(<span>"RoutesMarkTheSpot.pcapng"</span>)
ipv6 <span>=</span> [p <span>for</span> p <span>in</span> packets <span>if</span> filter_packet(p)]
ipv6<span>.</span>sort(key<span>=</span><span>lambda</span> pkt: pkt[IPv6]<span>.</span>fl)  <span># Sort by Flow Label</span>

flag <span>=</span> []
<span>for</span> pkt <span>in</span> ipv6:
    flow_label <span>=</span> pkt[IPv6]<span>.</span>fl
    payload <span>=</span> pkt[IPv6]<span>.</span>payload<span>.</span>load<span>.</span>decode(<span>'ascii'</span>)
    flag_char <span>=</span> re<span>.</span>search(<span>':(.*):'</span>, payload)<span>.</span>group(<span>1</span>)
    print(<span>f</span><span>"</span><span>{</span>pkt<span>.</span>summary()<span>}</span><span> ==&amp;gt; </span><span>{</span>flow_label<span>}</span><span> --&amp;gt; </span><span>{</span>payload<span>}</span><span> = '</span><span>{</span>flag_char<span>}</span><span>'"</span>)

    flag<span>.</span>append(flag_char)
print(<span>'</span><span>\n</span><span>'</span> <span>+</span> <span>''</span><span>.</span>join(flag))
</code></pre></div>

<div class="highlight"><pre tabindex="0"><code class="language-plaintext" data-lang="plaintext">Ether / [...] &amp;gt; [...] / Raw ==&amp;gt; 0 --&amp;gt; niEmoDOq9oRAvpi5fY4UndN1ofA1I5GVi4eHjuxLCzEuIoxG2LgW4YOohBlFVPQHKfK6rq13Grcyx6x9ZYtrawcyFbvJ8:D:R0CgOtT1UkbJaR6OIJ5KW2bmHHMKcQm8hB2ZEW15Y0ZV7umS5IwGiMaImomOORDGqzRBggvyPN = 'D'
Ether / [...] &amp;gt; [...] / Raw ==&amp;gt; 1 --&amp;gt; 67ZvMEolTtKmTSOZldsxTGqI6oiXr2Y2zPsJhkhGgXSnEdEDZlcNZmBS0w3AgnSrM9vpYXPi0BlPsZyY:A:UYd7TVQ1Zh6yofJJXo35GrSq6qgfH5NG9E87v8M3eSnT4JruZTbHCbZ0qNaggvsFTs9k5vtUhgVq44u51dtvdCGJuwso9aIDeuYccGen6Opn8q1UrYk = 'A'
[...]
</code></pre></div>

<p>🏁 <!-- raw HTML omitted -->DANTE{l4b3l5_c4n_m34n_m4ny_7h1ngs}<!-- raw HTML omitted --></p>

