(function(window1) {
    class URLQueryAppender {
        constructor(params){
            this.params = params;
        }
        /**
         * Appends query parameters to all A tags in the document
         */ appendToAllLinks() {
            const links = document.getElementsByTagName('a');
            Array.from(links).forEach((link)=>{
                if (link.href) link.href = this.appendParamsToUrl(link.href);
            });
        }
        /**
         * Appends query parameters to a specific URL
         */ appendParamsToUrl(url) {
            try {
                const urlObject = new URL(url);
                // Skip if it's a mailto: link or other non-http(s) protocol
                if (!urlObject.protocol.startsWith('http')) return url;
                Object.entries(this.params).forEach(([key, value])=>{
                    urlObject.searchParams.set(key, value);
                });
                return urlObject.toString();
            } catch (e) {
                console.error(`Error processing URL: ${url}`, e);
                return url;
            }
        }
    }
    class UTMLocalStore {
        static{
            this.UTM_KEY = "utm-data";
        }
        store(data) {
            const utmData = this.listUTMData() || [];
            try {
                localStorage.setItem(UTMLocalStore.UTM_KEY, JSON.stringify([
                    ...utmData,
                    data
                ]));
            } catch (error) {
                console.error('Error storing UTM data:', error);
            }
        }
        listUTMData() {
            try {
                const data = localStorage.getItem("utm-data");
                return data ? JSON.parse(data) : [];
            } catch (error) {
                console.error('Error retrieving UTM data:', error);
                return [];
            }
        }
        firstUTMData() {
            const utmDatas = this.listUTMData();
            return utmDatas.length > 0 ? utmDatas[0] : undefined;
        }
    }
    class UTMTracker {
        constructor(utmStore = new UTMLocalStore()){
            this.utmStore = utmStore;
        }
        extractUTMParams() {
            const urlParams = new URLSearchParams(window1.location.search);
            const referrer = document.referrer;
            return {
                "utm_source": urlParams.get('utm_source') || "",
                "utm_medium": urlParams.get('utm_medium') || "",
                "utm_campaign": urlParams.get('utm_campaign') || "",
                "utm_term": urlParams.get('utm_term') || "",
                "utm_content": urlParams.get('utm_content') || "",
                "utm_referrer": referrer || "",
                "timestamp": Date.now().toString()
            };
        }
        trackPageVisit() {
            const currentUTM = this.extractUTMParams();
            if (currentUTM.utm_source || currentUTM.utm_medium || currentUTM.utm_campaign) this.utmStore.store(currentUTM);
        }
        firstUTMData() {
            return this.utmStore.firstUTMData();
        }
    }
    // Add to window object
    const utmTracker = new UTMTracker();
    window1.UTMTracker = utmTracker;
    // Auto-track on script load
    window1.UTMTracker.trackPageVisit();
    // Example of how to use it with specific timing or events
    document.addEventListener('DOMContentLoaded', ()=>{
        const params = utmTracker.firstUTMData() || {};
        const appender = new URLQueryAppender(params);
        appender.appendToAllLinks();
    });
})(window);
