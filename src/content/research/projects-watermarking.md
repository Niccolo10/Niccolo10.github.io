---
title: "Image watermarking with DWT, SVD, and DCT"
description: "Embedding of a watermak using DWT-SVD and a DWT-DCT tranform."
category: Archive
date: 2022-10-18
draft: false
---

> From the archive. This article retains its original publication date; tools and recommendations reflect that period.


<p>Embedding of a watermak using DWT-SVD and a DWT-DCT tranform.</p>
<h2 id="challenge">Challenge</h2>
<p>In my project, I utilized <strong>advanced watermarking techniques</strong> to embed a mark of size 512x512 into three different images. The primary focus was to ensure the <strong>highest possible image quality</strong> while effectively embedding the watermark.</p>
<p>To achieve this, I combined <strong>cutting-edge watermarking techniques</strong> known for their ability to maintain image quality. These techniques involved optimizing the placement and strength of the watermark, considering factors such as perceptual masking and robustness to attacks.</p>
<p>After successfully embedding the watermark in the images, another crucial aspect of the project was to develop an <strong>attacking technique</strong>. The objective of this technique was to attempt to <strong>destroy the embedded mark</strong> created by another group while preserving the image’s best possible quality. Striking the right balance between attack effectiveness and its impact on overall image quality was paramount.</p>
<p>Throughout the project, special attention was given to the quality of the images to ensure seamless integration of the watermark without compromising visual appeal or clarity. By employing <strong>advanced watermarking techniques</strong> and devising an effective attacking strategy, the aim was to demonstrate the <strong>robustness and resilience</strong> of the embedded mark against potential attacks while maintaining the highest image quality.</p>
<h2 id="embedding-method-explanation">Embedding Method Explanation</h2>
<p>The watermarking method I employed utilizes two different mark embedding techniques:</p>
<ul>
<li>
<p>The first technique involves a <strong>two-level wavelet transform</strong> in the HL/HL quadrant, where a DCT transform is applied. The most significant bit is selected after sorting the bits, and an <strong>8-bit long code</strong> represents a single bit of the mark.</p>
</li>
<li>
<p>The second technique utilizes a <strong>three-level wavelet transform</strong> in the LL/LL/LL quadrant, applying SVD. In this case, a <strong>2-bit long code</strong> corresponds to a single bit of the mark.</p>
</li>
</ul>
<p>This embedding method is designed to simultaneously embed the mark in three different images. A CSV file is utilized for the WPSNR function in the detection method. The detection method takes the original image, the watermarked image, and the image after being attacked as inputs. It determines if the mark is still present in the attacked image and calculates the WPSNR of this image. This method can be easily modified to detect the presence of the mark in any given image.</p>
<div class="highlight"><pre tabindex="0"><code class="language-python" data-lang="python"><span>def</span> <span>mixed_embedding</span>(<span>....</span>):

    <span>#dwt </span>
    coefficient <span>=</span> pywt<span>.</span>dwt2(original, wavelet<span>=</span><span>'haar'</span>)
    quadrants <span>=</span> [coefficient[<span>0</span>],<span>*</span>coefficient[<span>1</span>]]

    coefficient2_dct <span>=</span> pywt<span>.</span>dwt2(quadrants[loc_dct_lv1], wavelet<span>=</span><span>'haar'</span>)
    quadrants2_dct <span>=</span> [coefficient2_dct[<span>0</span>],<span>*</span>coefficient2_dct[<span>1</span>]]
    coefficient2_svd <span>=</span> pywt<span>.</span>dwt2(quadrants[loc_svd_lv1], wavelet<span>=</span><span>'haar'</span>)
    quadrants2_svd <span>=</span> [coefficient2_svd[<span>0</span>],<span>*</span>coefficient2_svd[<span>1</span>]]

<span>#SVD SU TERZO LIVELLO</span>
    coefficient3_svd <span>=</span> pywt<span>.</span>dwt2(quadrants2_svd[loc_svd_lv1], wavelet<span>=</span><span>'haar'</span>)
    quadrants3_svd <span>=</span> [coefficient3_svd[<span>0</span>],<span>*</span>coefficient3_svd[<span>1</span>]

    size <span>=</span> quadrants2_dct[<span>1</span>]<span>.</span>shape[<span>0</span>]
    size_svd <span>=</span> quadrants3_svd[<span>1</span>]<span>.</span>shape[<span>0</span>]

    <span>#divisione in blocchi dei quadranti scelti</span>
    
    blocks_dct <span>=</span> quadrants2_dct[loc_dct_lv2]
    blocks_dct <span>=</span> np<span>.</span>hsplit(blocks_dct, size<span>//</span><span>4</span>)
    blocks_svd <span>=</span> quadrants3_svd[loc_svd_lv2]
    blocks_svd <span>=</span> np<span>.</span>hsplit(blocks_svd, size_svd<span>//</span><span>2</span>)

    <span>for</span> k <span>in</span> range(len(blocks_dct)):
      blocks_dct[k] <span>=</span> np<span>.</span>vsplit(blocks_dct[k], size<span>//</span><span>4</span>)
      blocks_svd[k] <span>=</span> np<span>.</span>vsplit(blocks_svd[k], size_svd<span>//</span><span>2</span>)

    <span># dct, svd; embedding; idct, isvd </span>

    <span>for</span> i <span>in</span> range(len(blocks_dct)):
      <span>for</span> j <span>in</span> range(len(blocks_dct)):
          blocks_dct[i][j] <span>=</span> dct(dct(blocks_dct[i][j],axis<span>=</span><span>0</span>, norm<span>=</span><span>'ortho'</span>),axis<span>=</span><span>1</span>, norm<span>=</span><span>'ortho'</span>)           
          U,S,VH <span>=</span> np<span>.</span>linalg<span>.</span>svd(blocks_svd[i][j])
          <span>if</span>(mark[i][j] <span>==</span> <span>0</span>):  
             blocks_dct[i][j] <span>+=</span> alpha_dct<span>*</span>(np<span>.</span>array(padding(blocks_dct[i][j],seq_0_dct))<span>.</span>reshape(<span>4</span>,<span>4</span>))
             S <span>+=</span>  alpha_svd<span>*</span>(np<span>.</span>array(seq_0_svd)) 
          <span>else</span>:
             blocks_dct[i][j] <span>+=</span> alpha_dct<span>*</span>(np<span>.</span>array(padding(blocks_dct[i][j],seq_1_dct))<span>.</span>reshape(<span>4</span>,<span>4</span>))
             S <span>+=</span>  alpha_svd<span>*</span>(np<span>.</span>array(seq_1_svd))

          blocks_svd[i][j] <span>=</span> np<span>.</span>dot(U<span>*</span>S,VH)
          blocks_dct[i][j] <span>=</span> idct(idct(blocks_dct[i][j],axis<span>=</span><span>1</span>, norm<span>=</span><span>'ortho'</span>),axis<span>=</span><span>0</span>, norm<span>=</span><span>'ortho'</span>)
    
    <span>for</span> k <span>in</span> range(len(blocks_dct)):
      blocks_dct[k] <span>=</span> np<span>.</span>array(np<span>.</span>vstack(blocks_dct[k]))<span>.</span>reshape(<span>128</span>,<span>4</span>)
      blocks_svd[k] <span>=</span> np<span>.</span>array(np<span>.</span>vstack(blocks_svd[k]))<span>.</span>reshape(<span>64</span>,<span>2</span>)
   
    quadrants2_dct[loc_dct_lv2] <span>=</span> np<span>.</span>array(np<span>.</span>hstack(blocks_dct))<span>.</span>reshape(<span>128</span>,<span>128</span>)
    quadrants3_svd[loc_svd_lv2] <span>=</span> np<span>.</span>array(np<span>.</span>hstack(blocks_svd))<span>.</span>reshape(<span>64</span>,<span>64</span>)

    coefficient3_svd <span>=</span> quadrants3_svd[<span>0</span>],(quadrants3_svd[<span>1</span>],quadrants3_svd[<span>2</span>],quadrants3_svd[<span>3</span>])
    quadrants2_svd[loc_svd_lv1] <span>=</span> pywt<span>.</span>idwt2(coefficient3_svd, wavelet<span>=</span><span>'haar'</span>)

    coefficient2_dct <span>=</span> quadrants2_dct[<span>0</span>],(quadrants2_dct[<span>1</span>],quadrants2_dct[<span>2</span>],quadrants2_dct[<span>3</span>])
    coefficient2_svd <span>=</span> quadrants2_svd[<span>0</span>],(quadrants2_svd[<span>1</span>],quadrants2_svd[<span>2</span>],quadrants2_svd[<span>3</span>])
    
    <span>#rimettiamo ogni quadrante al suo posto nel primo livello</span>
    quadrants[loc_dct_lv1] <span>=</span> pywt<span>.</span>idwt2(coefficient2_dct, wavelet<span>=</span><span>'haar'</span>)
    quadrants[loc_svd_lv1] <span>=</span> pywt<span>.</span>idwt2(coefficient2_svd, wavelet<span>=</span><span>'haar'</span>)
    
    coefficient <span>=</span> quadrants[<span>0</span>],(quadrants[<span>1</span>],quadrants[<span>2</span>],quadrants[<span>3</span>])
    final <span>=</span> pywt<span>.</span>idwt2(coefficient, wavelet<span>=</span><span>'haar'</span>)

    <span>return</span> np<span>.</span>uint8(np<span>.</span>rint(np<span>.</span>clip(final, <span>0</span>, <span>255</span>)))</code></pre></div>
<h2 id="attack-method-explanation">Attack Method Explanation</h2>
<p>The “attacks” file contains various <strong>brute-force attacks</strong> for destroying the mark on the images:</p>
<ul>
<li>
<p>“Base-attacks” is a brute-force method in the spatial domain. It applies different single methods (AWGN, BLUR, SHARPENING, MEDIAN-FILTER, RESIZING, JPEG) to the given image. The best attack from a list of successful attacks is selected, and attempts are made to attack the image again with combined attacks.</p>
</li>
<li>
<p>“Wavelet_attack” follows a similar approach as “Base-attacks.” However, the attack is localized in the area of the DWT transform where the mark seems to be, based on a comparison between the original and watermarked images.</p>
</li>
<li>
<p>“Ftt_attack” and “Dct_attack” work similarly to the other attacks, but they are localized on the most significant bit of the DCT or FTT, where the mark seems to be, after comparing the original and watermarked images.</p>
</li>
</ul>
<p>You can find my full project on the <a href="https://github.com/Niccolo10/DWT-SVD_DWT-DCT-image-watermaking/">Github Repository</a>, where you can also check the code.</p>

