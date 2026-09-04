export default function AiInsightsLink() {
  return (
    <section id='ai-insights'>
      <article>
        <title>AI-Generated Insights - Health Equity Tracker</title>

        <h2 className='mt-12 font-medium text-title'>AI-Generated Insights</h2>
        <p>
          Some charts and report summaries on the Health Equity Tracker include
          an AI-generated sentence or paragraph labeled "AI-generated. Verify
          with chart data." These insights are produced by a large language
          model. They are not written by our team and are not research findings.
        </p>

        <h3 id='ai-insights-what-model-receives'>What the model receives</h3>
        <p>
          When you request an insight, the rendered contents of the chart or
          table you are viewing — the topic, geography, demographic breakdown,
          and data rows — are sent to the model. The model has no access to
          anything else on the site and is not searching the web.
        </p>

        <h3 id='ai-insights-limitations'>Limitations</h3>
        <p>
          Language models can restate what a chart shows fluently while saying
          nothing that the chart does not already say, and they can state
          incorrect values with confidence. Specific rates and group comparisons
          should be read directly from the chart, which is the authoritative
          source on the page. Insights describe correlation in published data
          and do not establish cause.
        </p>

        <h3 id='ai-insights-data-flow'>Data flow and third-party processor</h3>
        <p>
          Chart contents are sent to Google's Gemini API to generate insights.
          The request originates from our server, not your browser, so the
          provider sees our server's address rather than yours. Only public
          aggregate data that the site already publishes is included — no
          personally identifiable information is sent.
        </p>
        <p>
          The model family is Gemini. The specific version may change over time
          as newer models become available.
        </p>

        <h3 id='ai-insights-flagging'>
          Reporting a harmful or inaccurate insight
        </h3>
        <p>
          Every insight includes a "Report harmful or inaccurate content" link.
          Submitting a report records the text and the reason for team review.
          After you report an insight, a fresh one is generated in its place so
          you can continue using the chart. Reports are our primary signal for
          catching outputs that need attention, and we review them regularly.
        </p>
      </article>
    </section>
  )
}
