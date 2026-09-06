---
title: "Evading Deepfake Classifier with Adversarial Attacks"
description: "An in-depth analysis of white-box adversarial attacks against deepfake-image detectors, exploring the vulnerability of AI-driven systems."
category: Archive
date: 2024-01-28
draft: false
---

> From the archive. This article retains its original publication date; tools and recommendations reflect that period.


<p>An in-depth analysis of white-box adversarial attacks against deepfake-image detectors, exploring the vulnerability of AI-driven systems.</p>
<h2 id="project-overview">Project Overview</h2>
<p>This project investigates the susceptibility of AI-driven deepfake-image detectors to white-box adversarial attacks, demonstrating how even well-designed models can be misled by systematically crafted input. The study is rooted in the techniques proposed by Carlini and Farid in their 2021 paper, focusing on the robustness of the ResNet-50 model.</p>
<h3 id="key-components-and-technologies-used">Key Components and Technologies Used</h3>
<ul>
<li><strong>ResNet-50</strong>: A deep learning model used as the baseline for detecting manipulated images.</li>
<li><strong>Python &amp; PyTorch</strong>: The core technologies for crafting adversarial examples and manipulating neural networks.</li>
</ul>
<h2 id="theoretical-background">Theoretical Background</h2>
<p>Adversarial attacks represent a significant threat to the integrity of machine learning models. These attacks involve creating input data that is perceptually similar to the original data but contains carefully crafted distortions that cause the model to make errors.</p>
<h3 id="distortion-minimizing-attack">Distortion-Minimizing Attack</h3>
<p>This attack subtly alters an image in a way that minimizes visible changes while still fooling the model. The goal is to create an image that looks unchanged to humans but is classified incorrectly by the model.</p>
<h3 id="loss-maximizing-attack">Loss-Maximizing Attack</h3>
<p>This approach intentionally maximizes the prediction error of the model. By doing so, it exploits the model’s vulnerabilities, causing it to misclassify the altered image with high confidence.</p>
<h2 id="detailed-attack-process">Detailed Attack Process</h2>
<p>The methodology for conducting these attacks involves several steps that manipulate the image data directly, aiming to explore the limits of model robustness.</p>
<h3 id="step-1-gradient-calculation">Step 1: Gradient Calculation</h3>
<p>The first step involves calculating the gradient of the model’s loss function with respect to the input image. This gradient tells us how to slightly alter the image to maximize the increase in loss, which correlates with an increased chance of misclassification.</p>
<div class="highlight"><pre tabindex="0"><code class="language-python" data-lang="python"><span># Calculate gradients</span>
<span>def</span> <span>calculate_gradients</span>(image, label, model):
    image<span>.</span>requires_grad <span>=</span> <span>True</span>
    output <span>=</span> model(image)
    loss <span>=</span> F<span>.</span>nll_loss(output, label)
    model<span>.</span>zero_grad()
    loss<span>.</span>backward()
    data_grad <span>=</span> image<span>.</span>grad<span>.</span>data
    <span>return</span> data_grad</code></pre></div>
<h3 id="step-2-image-perturbation">Step 2: Image Perturbation</h3>
<p>Using the gradients calculated in the first step, the image is adjusted by a small factor (epsilon), which is determined experimentally. This factor represents the intensity of the attack.</p>
<div class="highlight"><pre tabindex="0"><code class="language-python" data-lang="python"><span># Perturb the original image</span>
<span>def</span> <span>perturb_image</span>(original_image, epsilon, data_grad):
    sign_data_grad <span>=</span> data_grad<span>.</span>sign()
    perturbed_image <span>=</span> original_image <span>+</span> epsilon <span>*</span> sign_data_grad
    perturbed_image <span>=</span> torch<span>.</span>clamp(perturbed_image, <span>0</span>, <span>1</span>)  <span># Ensure pixel values remain between 0 and 1</span>
    <span>return</span> perturbed_image</code></pre></div>
<h3 id="step-3-evaluating-the-attack">Step 3: Evaluating the Attack</h3>
<p>After crafting the adversarial image, it’s crucial to assess its effectiveness. This involves running the perturbed image through the model again and observing whether the classification has changed.</p>
<div class="highlight"><pre tabindex="0"><code class="language-python" data-lang="python"><span># Evaluate the effectiveness of the adversarial image</span>
<span>def</span> <span>test_adversarial_image</span>(model, perturbed_image, true_label):
    output <span>=</span> model(perturbed_image)
    final_pred <span>=</span> output<span>.</span>max(<span>1</span>, keepdim<span>=</span><span>True</span>)[<span>1</span>]  <span># get the index of the max log-probability</span>
    <span>if</span> final_pred<span>.</span>item() <span>==</span> true_label<span>.</span>item():
        <span>return</span> <span>False</span>  <span># Attack failed</span>
    <span>else</span>:
        <span>return</span> <span>True</span>  <span># Attack successful</span></code></pre></div>
<h2 id="performance-analysis">Performance Analysis</h2>
<p>Our experiments with varying values of epsilon demonstrated that even minimal perturbations can deceive sophisticated deepfake detectors. These findings emphasize the need for incorporating robustness against adversarial attacks during the training phase of these models.</p>
<h2 id="conclusion">Conclusion</h2>
<p>This project not only highlights the effectiveness of white-box adversarial attacks but also underscores the critical need for defense mechanisms that can withstand such manipulations. Future research should focus on developing more advanced adversarial training techniques and exploring the potential of using generative adversarial networks (GANs) for strengthening model defenses.</p>
<p>Feel free to reach out with questions or for further discussion on this critical topic!</p>

