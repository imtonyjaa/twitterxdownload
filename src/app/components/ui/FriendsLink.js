"use client";

import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem
} from "@heroui/react";
import { getTranslation } from "@/lib/i18n";

const friendsLink = [
    {
      name: "Travel Map Video",
      url: "https://travelmap.video",
      icon: "https://travelmap.video/images/logo.png"
    },
    {
        name: "PDF Tool My",
        url: "https://pdftoolmy.com",
        icon: "https://pdftoolmy.com/favicon.svg"
    },
    {
        name: "Temp Mail My",
        url: "https://tempmailmy.com",
        icon: "https://tempmailmy.com/logo.png"
    }
]

export default function FriendsLink({ locale = 'en' }) {
    const t = function(key){
        return getTranslation(locale, key);
    }

  return (
    <Dropdown showArrow>
      <DropdownTrigger>
        {/* <Button variant="light" size="lg" className="capitalize"> */}
          <span className="text-md cursor-pointer">{t('Friends Link')}</span>
        {/* </Button> */}
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Friends Link"
        variant="flat"
        disallowEmptySelection
        selectionMode="single"
        onAction={(key) => {
            window.open(friendsLink[key].url, '_blank');
        }}
      >
        {friendsLink.map((item, index) => (
          <DropdownItem key={index}>
            <a href={item.url} target="_blank" className="flex items-center gap-2">
              <img src={item.icon} alt={item.name} width={36} height={36} className="mr-2"/>
              <div>
                <div>{item.name}</div>
                <div className="text-sm text-gray-500">{item.url}</div>
              </div>
            </a>
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}