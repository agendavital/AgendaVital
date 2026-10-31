import { useEffect, useRef } from "react";

const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

export default function RecaptchaCheckbox({ onToken }) {
    const containerRef = useRef(null);
    const widgetIdRef = useRef(null);
    const onTokenRef = useRef(onToken);

    onTokenRef.current = onToken;

    useEffect(() => {
        if (!siteKey || !containerRef.current) return undefined;

        let active = true;

        function renderWidget() {
            const enterprise = window.grecaptcha?.enterprise;
        
            if (!active || !enterprise?.ready || widgetIdRef.current !== null)
                return;
            
            enterprise.ready(() => {
                if (!active || widgetIdRef.current !== null) return;

                if (typeof enterprise.render !== "function") {
                    console.error("La API de rrCAPTCHA no ofrece el método render.");
                    return;
                }

                widgetIdRef.current = enterprise.render(containerRef.current, {
                    sitekey: siteKey,
                    callback: (token) => onTokenRef.current(token),
                    "expired-callback": () => onTokenRef.current(""),
                    "error-callback": () => onTokenRef.current(""),
                });
            });
        }

        let script = document.querySelector(
            "script[data-agendavital-recaptcha]",
        );

        if (!script) {
            script = document.createElement("script");
            script.src = "https://www.google.com/recaptcha/enterprise.js?render=explicit";
            script.async = true;
            script.defer = true;
            script.dataset.agendavitalRecaptcha = "true";
        }

        script.addEventListener("load", renderWidget);

        if (window.grecaptcha?.enterprise) {
            renderWidget();
        }

        if (!script.isConnected) {
            document.head.appendChild(script);
        }

        return () => {
            active = false;
            script.removeEventListener("load", renderWidget);

            if (
                widgetIdRef.current !== null &&
                window.grecaptcha?.enterprise
            ) {
                window.grecaptcha.enterprise.reset(widgetIdRef.current);
                widgetIdRef.current = null;
            }
        };
    }, []);

    return <div className="recaptcha-widget" ref={containerRef} />
} 
