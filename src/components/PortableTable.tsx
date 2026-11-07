type Row = { _key: string; cells: string[] };

export function PortableTable({ value }: { value: { rows?: Row[] } }) {
  const rows = value?.rows ?? [];
  if (!rows.length) return null;

  const [head, ...body] = rows;
  const isMatrix = (head.cells[0] ?? "").trim() === "";

  return (
    <div className={`sbt-table-wrap${isMatrix ? " sbt-matrix" : ""}`}>
      <table className="sbt-table">
        <thead>
          <tr>
            {head.cells.map((c, i) => (
              <th key={i} scope="col">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((r) => (
            <tr key={r._key}>
              {r.cells.map((c, i) =>
                i === 0 ? (
                  <th key={i} scope="row">
                    {c}
                  </th>
                ) : (
                  <td key={i}>{c}</td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
