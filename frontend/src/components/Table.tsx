interface Column<T> {
    key: keyof T;
    label: string;
    render?: (row: T) => React.ReactNode; // para formatear una celda (moneda, fecha, etc.)
}

interface TableProps<T> {
    columns: Column<T>[];
    data: T[];
    rowKey: keyof T;
    emptyMessage?: string;
}

export function Table<T>({
    columns,
    data,
    rowKey,
    emptyMessage = "Sin datos",
}: TableProps<T>) {
    if (data.length === 0) {
        return <p>{emptyMessage}</p>;
    }

    return (
        <table
            border={1}
            cellPadding={8}
            style={{ borderCollapse: "collapse", width: "100%" }}
        >
            <thead>
                <tr>
                    {columns.map((col) => (
                        <th key={String(col.key)}>{col.label}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {data.map((row) => (
                    <tr key={String(row[rowKey])}>
                        {columns.map((col) => (
                            <td key={String(col.key)}>
                                {col.render
                                    ? col.render(row)
                                    : String(row[col.key])}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
