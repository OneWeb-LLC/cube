import { createServerFn } from '@tanstack/react-start'

import { redeemEcosystemLaunchToken } from '@/lib/sso/redeem-launch-token.server'

export const redeemSsoLaunchToken = createServerFn({ method: 'POST' })
  .validator((data: { launchToken: string }) => data)
  .handler(async ({ data }) => redeemEcosystemLaunchToken(data.launchToken))
