// Copyright (C) 2012-2024 Zammad Foundation, https://zammad-foundation.org/

import { ref } from 'vue'

import { createDummyArticle } from '#shared/entities/ticket-article/__tests__/mocks/ticket-articles.ts'
import { convertToGraphQLId } from '#shared/graphql/utils.ts'

import { useEmailFileUrls } from '#desktop/pages/ticket/components/TicketDetailView/ArticleBubble/useEmailFileUrls.ts'

describe('useEmailFileUrls', () => {
  it('should return originalFormattingUrl and rawMessageUrl', () => {
    const { originalFormattingUrl, rawMessageUrl } = useEmailFileUrls(
      ref(
        createDummyArticle({
          attachmentsWithoutInline: [
            {
              id: convertToGraphQLId('Store', 123),
              preferences: {
                'original-format': true,
              },
              internalId: 123,
              name: 'test.txt',
            },
          ],
        }),
      ),
      ref(222),
    )

    expect(originalFormattingUrl.value).toBe(
      '/ticket_attachment/222/1/123?disposition=attachment',
    )
    expect(rawMessageUrl.value).toBe('/api/v1/ticket_article_plain/1')
  })
})
