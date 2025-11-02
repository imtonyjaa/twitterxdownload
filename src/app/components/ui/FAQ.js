'use client';
import {Accordion, AccordionItem} from "@heroui/react";
import { getTranslation } from '@/lib/i18n';

export default function FAQ({locale='en'}) {
    const t = function(key){
        return getTranslation(locale, key);
    }
    return (
        <Accordion
            selectionMode="multiple"
            className="border-foreground/10 border-[1px] rounded-2xl px-6"
        >
            <AccordionItem key="1" aria-label="How to download" title={t("How do I download Twitter videos?")}>
              {t("Simply paste the Twitter video URL into the input box above and click the Download button. Our service will process the video and provide you with a download link.")}
            </AccordionItem>
            <AccordionItem key="2" aria-label="Free service" title={t("Is it really free to use?")}>
              {t("Yes, our service is completely free to use. There are no hidden charges or registration requirements.")}
            </AccordionItem>
            <AccordionItem key="3" aria-label="Supported formats" title={t("What video formats are supported?")}>
              {t("We support all video formats available on Twitter, including MP4 and other common formats. The quality of the downloaded video will match the original.")}
            </AccordionItem>
        </Accordion>
    )
}