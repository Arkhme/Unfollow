import dayjs from "@renderer/lib/dayjs"
import { EntriesResponse } from "@renderer/lib/types"
import { Image } from "@renderer/components/ui/image"
import { FeedIcon } from "@renderer/components/feed-icon"

export function PictureItem({ entry }: { entry: EntriesResponse[number] }) {
  return (
    <div>
      <div>
        <div className="flex gap-2 overflow-x-auto">
          {entry.images?.slice(0, 1).map((image) => (
            <Image
              key={image}
              src={image}
              className="w-full aspect-square shrink-0 rounded-md object-cover"
              loading="lazy"
              proxy={{
                width: 600,
                height: 600,
              }}
            />
          ))}
        </div>
        <div className="line-clamp-5 text-sm flex-1 px-2 pb-3 pt-1">
          <div className="font-medium line-clamp-2">{entry.title}</div>
          <div className="space-x-1 text-[13px]">
            <FeedIcon
              className="w-3.5 h-3.5 inline-block mr-0 align-sub"
              feed={entry.feeds}
            />
            <span>{entry.feeds.title}</span>
            <span className="text-zinc-500">·</span>
            <span className="text-zinc-500">
              {dayjs
                .duration(
                  dayjs(entry.publishedAt).diff(dayjs(), "minute"),
                  "minute",
                )
                .humanize()}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
