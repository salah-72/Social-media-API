import { Model } from 'mongoose';
import { getUsersFromCache } from '@/utils/getUsersFromCache';
import { logger } from '@/lib/winston';

type CachedUser = NonNullable<
  Awaited<ReturnType<typeof getUsersFromCache>>[number]
>;

interface PaginatedUserListOptions<TDoc extends Record<string, unknown>> {
  model: Model<any>;
  filter: Record<string, any>;
  userField: string;
  page: number;
  limit: number;
  select?: string;
  sort?: Record<string, 1 | -1>;
  mapItem?: (doc: TDoc, user: CachedUser) => unknown;
  warnLabel?: string;
}

export const fetchPaginatedUserList = async <
  TDoc extends Record<string, unknown>,
>({
  model,
  filter,
  userField,
  page,
  limit,
  select,
  sort,
  mapItem,
  warnLabel,
}: PaginatedUserListOptions<TDoc>) => {
  const skip = (page - 1) * limit;

  let query = model.find(filter);
  if (select) query = query.select(select);
  if (sort) query = query.sort(sort);

  const [docs, total] = await Promise.all([
    query.skip(skip).limit(limit).lean<TDoc[]>(),
    model.countDocuments(filter),
  ]);

  const userIds = docs.map((d) => String(d[userField]));
  const usersData = await getUsersFromCache(userIds);

  const items = docs
    .map((doc, idx) => {
      const user = usersData[idx];
      if (!user) {
        if (warnLabel) logger.warn(`User data missing in ${warnLabel}`);
        return null;
      }
      return mapItem ? mapItem(doc, user) : { user };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return { items, total };
};
