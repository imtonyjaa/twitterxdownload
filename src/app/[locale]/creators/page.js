import { Card, CardHeader, Avatar } from "@heroui/react";
import Link from 'next/link';
import { headers } from 'next/headers'

export default async function Creators({ params: { locale } }) {

    const headersList = await headers()
    const host = headersList.get('host')
    const protocol = headersList.get('x-forwarded-proto') || 'http'
    
    const baseUrl = `${protocol}://${host}`
    const creatorsResp = await fetch(`${baseUrl}/api/requestdb?action=creators&limit=100`);
    const creatorsData = await creatorsResp.json();
    const creators = creatorsData.data;

    return (
        <div className="page-container">
            <div className='section flex flex-wrap gap-5 justify-between'>
            {creators.map((creator) => (
                <Card
                    as={Link}
                    href={`https://x.com/${creator.screen_name}`}
                    title={`${creator.name} ${creator.screen_name}`}
                    target="_blank"
                    shadow="none"
                    disableRipple
                    className="select-none box-border border-foreground/10 border-[1px] md:w-[260px] w-[46%] p-2 flex-shrink-0"
                    radius="lg"
                    key={creator.screen_name}
                >
                    <CardHeader className="justify-between gap-5">
                        <Avatar
                            isBordered
                            radius="full"
                            size="md"
                            alt={`${creator.name} avatar`}
                            src={creator.profile_image}
                        />
                        <div className="flex flex-col gap-1 items-start justify-center overflow-hidden flex-1">
                            <h4 className="w-full text-small font-semibold leading-none text-default-600 text-ellipsis overflow-hidden whitespace-nowrap">{creator.name}</h4>
                            <h5 className="w-full text-small tracking-tight text-default-400 text-ellipsis overflow-hidden whitespace-nowrap">@{creator.screen_name}</h5>
                        </div>
                    </CardHeader>
                </Card>
            ))}    
            </div>      
        </div>
    );
}