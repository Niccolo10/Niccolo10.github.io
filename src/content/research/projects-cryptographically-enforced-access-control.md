---
title: "Cryptographically enforced access control"
description: "Desing and implement a Cryptographically Enforced Access Control using CP-ABE"
category: Archive
date: 2023-11-08
draft: false
---

> From the archive. This article retains its original publication date; tools and recommendations reflect that period.


<p>Desing and implement a Cryptographically Enforced Access Control using CP-ABE</p>
<h2 id="definition-of-data-model">Definition of Data Model</h2>
<p>The data model comprises entities: patients, doctors, hospitals, insurance agencies, employers, and health clubs. Additionally, a trusted authority exists, representing an entity trusted by everyone but not an actual entity. For instance, a reputable hospital or a government agency can become a trusted authority.</p>
<h3 id="entities-and-data-involved">Entities and Data Involved</h3>
<ul>
<li><strong>Authority’s public key</strong> $PK$: Accessible to all.</li>
<li><strong>Authority’s master key</strong> $MK$: Known only to the authority.</li>
<li><strong>List of all parties and their attributes</strong>: Managed by the authority.</li>
<li><strong>Each party’s secret key</strong> $SK$: Distributed by the authority and known only to the party.</li>
<li><strong>Encrypted health records</strong>: Stored in the trusted authority’s server, available for download by all, but decrypting them enforces specific policies.</li>
</ul>
<h3 id="requirements">Requirements</h3>
<ul>
<li>Encrypt patients' records.</li>
<li>Allow patients access to their data.</li>
<li>Enable patients to selectively share records with doctors, insurance agencies, and employers.</li>
<li>Permit hospitals to insert new records during patient visits.</li>
<li>Allow health clubs to insert records for their members.</li>
</ul>
<h2 id="access-control-protocol-description">Access Control Protocol Description</h2>
<h3 id="cp-abe-ciphertext-policy-attribute-based-encryption">CP-ABE (Ciphertext-Policy Attribute-Based Encryption)</h3>
<p>Our implementation is based on the CP-ABE protocol defined in BSW07 \cite{BSW}. CP-ABE associates each encrypted file with a policy tree dictating access. Entities have attribute lists.</p>
<h4 id="cp-abe-protocol-procedure">CP-ABE Protocol Procedure</h4>
<ol>
<li>The trusted authority runs the <strong>Setup</strong> algorithm, publishing $PK$, and retains $MK$.</li>
</ol>
<div class="highlight"><pre tabindex="0"><code class="language-python" data-lang="python"><span>from</span> charm.toolbox.pairinggroup <span>import</span> PairingGroup
<span>from</span> charm.schemes.abenc.abenc_bsw07 <span>import</span> CPabe_BSW07

<span>class</span> <span>KeyDistributor</span>:
    <span>global</span> master_public_key, master_key

    <span># init method or constructor</span>
    <span>def</span> __init__(self, cpabe):
        self<span>.</span>cpabe <span>=</span> cpabe
        
        self<span>.</span>master_public_key, self<span>.</span>master_key <span>=</span> cpabe<span>.</span>setup()
 
    <span>def</span> <span>create_secret_key</span>(self, attributes: list):

        <span>return</span> self<span>.</span>cpabe<span>.</span>keygen(self<span>.</span>master_public_key, self<span>.</span>master_key, attributes)

</code></pre></div>

<ol start="2">
<li>The authority maintains a list of involved parties and their attributes, running <strong>KeyGen</strong> for all parties and distributing secret keys accordingly.</li>
<li>Any entity with $PK$ and a specified access tree can encrypt a document.</li>
</ol>
<div class="highlight"><pre tabindex="0"><code class="language-python" data-lang="python"><span>def</span> <span>insert</span>(self, data:HealthData, access_policy, password_manager, entities: list[Entity]):
        
        max_attempts <span>=</span> <span>3</span>  <span># Adjust the number of maximum attempts as needed</span>
        attempts <span>=</span> <span>0</span>
        
        <span>while</span> attempts <span>&lt;</span> max_attempts:
            patient_password <span>=</span> input(<span>"Patient_</span><span>{}</span><span> password: "</span><span>.</span>format(self<span>.</span>entity_id))
            check <span>=</span> password_manager<span>.</span>check_password(self, patient_password)
            access_policy <span>=</span> <span>f</span><span>"(</span><span>{</span>self<span>.</span>entity_type<span>}{</span>self<span>.</span>entity_id<span>}</span><span>)"</span>
            <span>if</span> check:
                <span>for</span> entity <span>in</span> entities:
                    <span>if</span> entity<span>.</span>entity_type <span>==</span> <span>"Hospital"</span>:
                        self<span>.</span>addRights(entity)
                        print(<span>f</span><span>"Hospital </span><span>{</span>entity<span>.</span>name<span>}</span><span> </span><span>{</span>entity<span>.</span>location<span>}</span><span> have write rights on </span><span>{</span>self<span>.</span>entity_type<span>}{</span>self<span>.</span>entity_id<span>}</span><span> records"</span>)
                    access_policy <span>=</span> <span>f</span><span>'(</span><span>{</span>access_policy<span>}</span><span> OR (</span><span>{</span>entity<span>.</span>entity_type<span>}{</span>entity<span>.</span>entity_id<span>}</span><span>))'</span>
                <span>#print(access_policy)</span>
                cipher_text <span>=</span> self<span>.</span>cpabe<span>.</span>encrypt(self<span>.</span>master_public_key, data<span>.</span>msg, access_policy)
                self<span>.</span>records<span>.</span>append(cipher_text)

                <span>break</span>
            <span>else</span>:
                attempts <span>+=</span> <span>1</span>
                <span>if</span> attempts <span>&lt;</span> max_attempts:
                    print(<span>"Incorrect password. Please try again."</span>)
                    
        <span>if</span> attempts <span>==</span> max_attempts:
            print(<span>"Maximum password attempts reached. Access denied."</span>)
        
</code></pre></div>

<ol start="4">
<li>Entities whose attributes match the access tree can run <strong>Decrypt</strong> to access the plaintext document.</li>
</ol>
<div class="highlight"><pre tabindex="0"><code class="language-python" data-lang="python">    <span>def</span> <span>read</span>(self, record):
        
        msg <span>=</span> self<span>.</span>cpabe<span>.</span>decrypt(self<span>.</span>master_public_key, self<span>.</span>secret_key, record)
        print(<span>f</span><span>"Patient </span><span>{</span>self<span>.</span>name<span>}</span><span> </span><span>{</span>self<span>.</span>surname<span>}</span><span> read </span><span>{</span>msg<span>}</span><span>"</span>)
</code></pre></div>

<h3 id="design-choice">Design Choice</h3>
<p>In our Personal Health Record (PHR) system design, we favor attribute-based encryption (ABE) for granular access control. For example, Patient A’s doctor shouldn’t access Patient B’s data if they aren’t treated by the same doctor. This calls for avoiding role-based access control or the access matrix model. Within ABE, we select ciphertext-policy (CP) over key-policy due to the latter’s impractical public key enumeration. However, CP-ABE introduces a single point of failure due to the trusted authority.</p>
<p>We maintain a list of parties: patients, doctors, hospitals, insurance agencies, employers, and health clubs. Each entity has specific attributes for precise access control, including UIDs and doctors' specialties (e.g., <code>cardiology</code>, <code>nephrology</code>). Including all UIDs is crucial for precise access rights control.</p>
<h3 id="authentication-and-insertion">Authentication and Insertion</h3>
<p>To facilitate insertion, two solutions using Access Control Lists (ACLs) are proposed.</p>
<h4 id="first-solution-static-password">First Solution: Static Password</h4>
<ul>
<li>Entities provide a static “uploading password” upon creation.</li>
<li>Entities verify passwords with the authority for insertion rights.</li>
<li>However, this method poses security risks and heavily relies on the central authority.</li>
</ul>
<h4 id="second-solution-abe-access-policy-as-acl">Second Solution: ABE Access Policy as ACL</h4>
<ul>
<li>The authority generates an ACL file encrypted with a policy tree allowing only the patient to read.</li>
<li>Patients re-encrypt the file with additional attributes for hospitals/health clubs.</li>
</ul>
<div class="highlight"><pre tabindex="0"><code class="language-python" data-lang="python">    <span>def</span> <span>addRights</span>(self, entity):
        psw <span>=</span> self<span>.</span>group<span>.</span>random(GT)
        old_policy <span>=</span> self<span>.</span>guestWriteAccess[<span>"policy"</span>]
        <span># print(f"{old_policy = }")</span>
        policy <span>=</span> <span>f</span><span>'(</span><span>{</span>old_policy<span>}</span><span> OR (</span><span>{</span>entity<span>.</span>entity_type<span>}{</span>entity<span>.</span>entity_id<span>}</span><span>))'</span>
        <span># print(policy)</span>
        
        cipher_psw <span>=</span> self<span>.</span>cpabe<span>.</span>encrypt(self<span>.</span>master_public_key, psw, policy)
        <span># print(f"{cipher_psw = }")</span>

        self<span>.</span>guestWriteAccess[<span>'psw'</span>] <span>=</span> cipher_psw
        self<span>.</span>guestWriteAccess[<span>'policy'</span>] <span>=</span> policy
    
        <span>return</span>
</code></pre></div>

<ul>
<li>Entities retrieve passwords from the ACL file for file insertion, and the authority modifies passwords when necessary.</li>
</ul>
<div class="highlight"><pre tabindex="0"><code class="language-python" data-lang="python"><span>def</span> <span>writePatient</span>(self, patient, data:HealthData, password_manager):
        max_attempts <span>=</span> <span>3</span>  <span># Adjust the number of maximum attempts as needed</span>
        attempts <span>=</span> <span>0</span>

        <span>if</span> data<span>.</span>type <span>!=</span> <span>"Health"</span>:
            print(<span>"You are not allowed to insert this type of data"</span>)
            <span>#raise Exception("You are not allowed to insert this type of data")</span>

        <span>while</span> attempts <span>&lt;</span> max_attempts:
            
            health_password <span>=</span> input(<span>"Hospital_</span><span>{}</span><span> password: "</span><span>.</span>format(self<span>.</span>entity_id))
            check <span>=</span> password_manager<span>.</span>check_password(self, health_password)
            <span>if</span> check:
                toDec <span>=</span> patient<span>.</span>get_crypted_psw()
                decrypted <span>=</span> self<span>.</span>cpabe<span>.</span>decrypt(self<span>.</span>master_public_key, self<span>.</span>secret_key, toDec)
                right_check <span>=</span> patient<span>.</span>right_check(decrypted)
                <span>if</span> right_check:
                    access_policy <span>=</span> <span>f</span><span>'((</span><span>{</span>patient<span>.</span>entity_type<span>}{</span>patient<span>.</span>entity_id<span>}</span><span>))'</span>
                    <span># msg = self.group.random(GT)</span>
                    cipher_text <span>=</span> self<span>.</span>cpabe<span>.</span>encrypt(self<span>.</span>master_public_key, data<span>.</span>msg, access_policy)
                    patient<span>.</span>records<span>.</span>append(cipher_text)
                    <span>break</span>
                <span>else</span>:
                    print(<span>"You are not allowed to write for this user"</span>)
                    <span>break</span>
            <span>else</span>:
                attempts <span>+=</span> <span>1</span>
                <span>if</span> attempts <span>&lt;</span> max_attempts:
                    print(<span>"Incorrect password. Please try again (Max 3 attempts)"</span>)
                    
        <span>if</span> attempts <span>==</span> max_attempts:
            print(<span>"Maximum password attempts reached. Access denied."</span>)
        <span>return</span>
</code></pre></div>

<p>The second solution, built atop the reading access control system, offers more security but assumes parties' non-collusion and introduces occasional password entries for hospitals.</p>
<h2 id="implementation-details">Implementation Details</h2>
<ul>
<li><strong>Operating System</strong>: Linux</li>
<li><strong>Language</strong>: Python v3.10.12</li>
</ul>
<p>Our implementation utilizes the <code>charm.schemes.abenc.abenc_bsw07</code> module in the Charm-Crypto v0.50 Python package. We chose a supersingular elliptic curve with a $512$-bit base field as the bilinear group. Each entity, when creating a patient’s health record, determines a policy tree for encryption, enabling selective access. For insertion authentication, passwords are generated via <code>bcrypt</code> hashing.</p>
<p>Serialization and deserialization complexities within the Charm-Crypto package hinder the implementation’s security. A custom serializer/deserializer is necessary for secure information storage.</p>
<h2 id="access-policy-definition">Access Policy Definition</h2>
<p>The mathematical definition of the access policy (policy tree $\mathcal T$) is detailed in Section 2.1, representing various scenarios for reading and inserting files.</p>
<h3 id="access-policy-scenarios-for-reading-files">Access Policy Scenarios for Reading Files</h3>
<ol>
<li><strong>Patient A’s record after seeing Doctor B</strong>: A.patient_id or B.doctor_id</li>
<li><strong>Patient A’s record after seeing Doctor B and agreeing to share it with all neurologists</strong>: A.patient_id or B.doctor_id or specialization=neurology</li>
<li><strong>Patient A’s record created by Hospital B after visiting the hospital</strong>: A.patient_id or B.hospital_id</li>
<li><strong>Patient A’s record from Hospital B shared with Employer C and Insurance Agency D for insurance claim</strong>: A.patient_id or B.hospital_id or C.employer_id or D.insurance_id</li>
</ol>
<h3 id="access-policy-scenarios-for-inserting-files">Access Policy Scenarios for Inserting Files</h3>
<ol>
<li><strong>When Patient A is born</strong>: A.patient_id</li>
<li><strong>When Patient A visits Doctor B and B wants to add new files to A’s record</strong>: A.patient_id or B.doctor_id</li>
<li><strong>When Patient A visits Hospital B</strong>: A.patient_id or B.hospital_id</li>
<li><strong>When Patient A joins Health Club B</strong>: A.patient_id or B.club_id</li>
<li><strong>When Patient A is sent to hospital B while exercising as a member of Health Club C</strong>: A.patient_id or B.hospital_id or C.club_id</li>
</ol>
<h2 id="conclusion">Conclusion</h2>
<p>Acknowledging flaws within our code, the demonstration serves its purpose: showcasing a practical implementation fulfilling requirements and exemplifying CP-ABE’s usage in our problem domain.</p>

