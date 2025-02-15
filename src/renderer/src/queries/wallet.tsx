import { useAuthQuery } from "@renderer/hooks/common"
import { apiClient, getFetchErrorMessage } from "@renderer/lib/api-fetch"
import { defineQuery } from "@renderer/lib/defineQuery"
import { useSettingModal } from "@renderer/modules/settings/modal/hooks"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"

export const wallet = {
  get: ({ userId }: { userId?: string } = {}) =>
    defineQuery(
      ["wallet", userId].filter(Boolean),
      async () => {
        const res = await apiClient.wallets.$get({
          query: { userId },
        })

        return res.data
      },
      {
        rootKey: ["wallet"],
      },
    ),

  claimCheck: () =>
    defineQuery(["wallet", "claimCheck"], async () =>
      apiClient.wallets.transactions["claim-check"].$get(),
    ),

  transactions: {
    get: (query: Parameters<typeof apiClient.wallets.transactions.$get>[0]["query"] = {}) =>
      defineQuery(
        ["wallet", "transactions", query].filter(Boolean),
        async () => {
          const res = await apiClient.wallets.transactions.$get({ query })

          return res.data
        },
        {
          rootKey: ["wallet", "transactions"],
        },
      ),
  },
}

export const useWallet = ({ userId }: { userId?: string } = {}) =>
  useAuthQuery(wallet.get({ userId }), { enabled: !!userId })

export const useWalletTransactions = (query: Parameters<typeof wallet.transactions.get>[0] = {}) =>
  useAuthQuery(wallet.transactions.get(query))

export const useCreateWalletMutation = () =>
  useMutation({
    mutationKey: ["createWallet"],
    mutationFn: () => apiClient.wallets.$post(),
    async onError(err) {
      toast.error(await getFetchErrorMessage(err))
    },
    onSuccess() {
      wallet.get().invalidate()
      toast("🎉 Wallet created.")
    },
  })

export const useClaimCheck = () =>
  useAuthQuery(wallet.claimCheck(), {
    refetchInterval: 1 * 60 * 60 * 1000,
  })

export const useClaimWalletDailyRewardMutation = () => {
  const settingModalPresent = useSettingModal()

  return useMutation({
    mutationKey: ["claimWalletDailyReward"],
    mutationFn: () => apiClient.wallets.transactions.claim_daily.$post(),
    async onError(err) {
      toast.error(getFetchErrorMessage(err))
    },
    onSuccess() {
      wallet.get().invalidate()
      wallet.claimCheck().invalidate()
      window.posthog?.capture("daily_reward_claimed")

      toast(
        <div
          className="flex items-center gap-1 text-lg"
          onClick={() => settingModalPresent("wallet")}
        >
          <i className="i-mgc-power text-accent animate-flip" />
        </div>,
        {
          unstyled: true,
          position: "bottom-left",
          classNames: {
            toast: "w-full flex justify-start !shadow-none !bg-transparent",
          },
        },
      )
    },
  })
}

export const useWalletTipMutation = () =>
  useMutation({
    mutationKey: ["walletTip"],
    mutationFn: (data: Parameters<typeof apiClient.wallets.transactions.tip.$post>[0]["json"]) =>
      apiClient.wallets.transactions.tip.$post({ json: data }),
    async onError(err) {
      toast.error(getFetchErrorMessage(err))
    },
    onSuccess(_, variables) {
      wallet.get().invalidate()
      wallet.transactions.get().invalidate()
      window.posthog?.capture("tip_sent", {
        amount: variables.amount,
        entryId: variables.entryId,
      })
      toast("🎉 Tipped.")
    },
  })
