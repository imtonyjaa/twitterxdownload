import { getTranslation } from '@/lib/i18n';

export default function MoreFeatures({locale='en'}) {
    const t = function(key){
        return getTranslation(locale, key);
    }

    const items = [
      {
        title: t("The tweets search engine helps you with Twitter marketing"),
        content: t("TwitterXDownload offers a powerful trending tweet search function, helping you track popular Twitter creators and trending tweets.")
      },
      {
        title: t("Translate any tweet into multiple languages and then re-post it"),
        content: t("With the tweet translator, you can easily translate tweets into multiple languages and re-post them to your account.")
      }
    ]

    return (
        <div
            className="border-foreground/10 border-[1px] rounded-2xl px-4 py-6 flex flex-col gap-6"
        >
            {items.map((item, index) => {
                  return (
                    <div className="px-2 flex flex-col gap-2" key={index}>
                      <div className="text-[18px] font-bold">{item.title}</div>
                      <div className="text-[16px] text-foreground/70">{item.content}</div>
                    </div>
                  )
              }
            )}
        </div>
    )
}