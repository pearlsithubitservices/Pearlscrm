import React from "react";

export default function DataTable({ columns, data }) {
  return (
    <div className="contacts-table-wrapper">
      <table className="contacts-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.accessor}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row, index) => (
            <tr key={row._id || index}>
              {columns.map((column) => (
                <td key={column.accessor}>
                  {column.render
                    ? column.render(row)
                    : row[column.accessor] || "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}